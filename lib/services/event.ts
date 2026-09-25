import { db, getDbTransaction } from "@/lib/database/client";
import { event, eventAttendee, eventCoHost, eventSettings } from "@/lib/database/schemas/event";
import { user } from "@/lib/database/schemas/auth";
import { tribe, tribeSettings } from "@/lib/database/schemas/tribe";
import { media } from "@/lib/database/schemas/media";
import { poll, pollOption } from "@/lib/database/schemas/poll";
import { comment } from "@/lib/database/schemas/post";
import { activity } from "@/lib/database/schemas/activity";
import { eq, and, desc, sql, inArray, asc, or, isNull, gt, lte, exists, type SQL } from "drizzle-orm";
import { createActivity } from "./activity";
import { appLink, eventAttendeeIds, eventHostIds, notify, tribeMemberIds, type NotifyExecutor } from "./notifications";
import { excludeBlocked } from "./blocks";

/**
 * The status an event has now (TRI-240). `event.status` is written once at creation and never
 * advanced, so every read and filter derives it from the dates; `cancelled` is the only stored value
 * that sticks.
 */
export const effectiveEventStatus = sql<"upcoming" | "ongoing" | "completed" | "cancelled">`(case
  when ${event.status} = 'cancelled' then 'cancelled'
  when coalesce(${event.endDate}, ${event.startDate}) < now() then 'completed'
  when ${event.startDate} <= now() then 'ongoing'
  else 'upcoming' end)`;
import { userPreviewColumns, userWithUsernameColumns } from "@/lib/database/user-columns";
import type {
  EventWithCreator,
  EventWithDetails,
  Poll,
  Event,
  EventAttendeeWithUser,
} from "@/lib/database/types";

export type RsvpStatus = "going" | "maybe" | "not_going";

// Thrown by addEventAttendee when `going` would exceed capacity; the route answers 409.
export class EventFullError extends Error {
  constructor(public readonly waitlisted: boolean) {
    super(waitlisted ? "This event is full; you are on the waitlist" : "This event is full");
    this.name = "EventFullError";
  }
}

type RsvpRules = {
  guestAllowance: number;
  capacityLimit: number | null;
  waitlistEnabled: boolean;
  rsvpDeadline: Date | null;
  attendeeVisibility: "all_members" | "count_only" | "hidden";
};

const DEFAULT_RSVP_RULES: RsvpRules = {
  guestAllowance: 0,
  capacityLimit: null,
  waitlistEnabled: true,
  rsvpDeadline: null,
  attendeeVisibility: "all_members",
};

/**
 * The RSVP-facing slice of `event_settings` for a set of events, keyed by event id, in one query.
 * The row is created lazily (first GET /settings, or the web app), so most events have none and
 * get `DEFAULT_RSVP_RULES`.
 *
 * Shape decision (TRI-161): these ride on the event payload as FLAT fields (`capacityLimit`,
 * `rsvpDeadline`, `guestAllowance`, `waitlistEnabled`, `attendeeVisibility`), not as a nested
 * `settings` preview object. Reasons: the mobile contract already declares them flat on `Event`;
 * the detail has shipped them flat since TRI-10/TRI-13; a nested `settings` would collide with
 * `EventWithSettings.settings` (the full bundle behind GET /settings) and read as "the settings
 * row" when it is only the always-rendered slice; and the fields are renamed for the reader
 * (`waitlistEnabled`, not the column's `enableWaitlist`), which a row-shaped object would not do.
 * Precedent for TRI-155: a settings field the screen always draws goes flat on the parent payload
 * with a defaulted value; anything edit-only stays behind its settings route.
 */
async function rsvpRulesForMany(eventIds: string[]): Promise<Map<string, RsvpRules>> {
  const rules = new Map<string, RsvpRules>();
  if (eventIds.length === 0) return rules;
  const rows = await db
    .select({
      eventId: eventSettings.eventId,
      guestAllowance: eventSettings.guestAllowance,
      capacityLimit: eventSettings.capacityLimit,
      enableWaitlist: eventSettings.enableWaitlist,
      rsvpDeadline: eventSettings.rsvpDeadline,
      attendeeVisibility: eventSettings.attendeeVisibility,
    })
    .from(eventSettings)
    .where(inArray(eventSettings.eventId, eventIds));
  for (const row of rows) {
    rules.set(row.eventId, {
      guestAllowance: row.guestAllowance ?? DEFAULT_RSVP_RULES.guestAllowance,
      capacityLimit: row.capacityLimit ?? DEFAULT_RSVP_RULES.capacityLimit,
      waitlistEnabled: row.enableWaitlist ?? DEFAULT_RSVP_RULES.waitlistEnabled,
      rsvpDeadline: row.rsvpDeadline ?? DEFAULT_RSVP_RULES.rsvpDeadline,
      attendeeVisibility: row.attendeeVisibility ?? DEFAULT_RSVP_RULES.attendeeVisibility,
    });
  }
  return rules;
}

async function rsvpRulesFor(eventId: string): Promise<RsvpRules> {
  return (await rsvpRulesForMany([eventId])).get(eventId) ?? DEFAULT_RSVP_RULES;
}

type EventCounts = { pollCount: number; commentCount: number };

/**
 * Polls and comments per event (contract `Event.pollCount` / `Event.commentCount`, EVT-16), keyed by
 * event id: two grouped queries for any number of events, the way post counts are batched in
 * `lib/services/post.ts`. Every poll counts (open or closed) and every comment counts (replies too),
 * matching what the event's poll and discussion tabs list. Events with none are simply absent, so
 * callers default to 0.
 */
async function eventCountsFor(eventIds: string[]): Promise<Map<string, EventCounts>> {
  const counts = new Map<string, EventCounts>();
  if (eventIds.length === 0) return counts;
  const [pollRows, commentRows] = await Promise.all([
    db
      .select({ eventId: poll.eventId, count: sql<number>`count(*)::int` })
      .from(poll)
      .where(inArray(poll.eventId, eventIds))
      .groupBy(poll.eventId),
    db
      .select({ eventId: comment.eventId, count: sql<number>`count(*)::int` })
      .from(comment)
      .where(inArray(comment.eventId, eventIds))
      .groupBy(comment.eventId),
  ]);
  const get = (id: string) => counts.get(id) ?? { pollCount: 0, commentCount: 0 };
  for (const row of pollRows) counts.set(row.eventId as string, { ...get(row.eventId as string), pollCount: row.count });
  for (const row of commentRows) counts.set(row.eventId as string, { ...get(row.eventId as string), commentCount: row.count });
  return counts;
}

type RsvpCounts = { going: number; maybe: number };

// `going` is people plus their guests (the contract's attendeeCount); `maybe` is people.
async function rsvpCountsFor(eventIds: string[]): Promise<Map<string, RsvpCounts>> {
  const counts = new Map<string, RsvpCounts>();
  if (eventIds.length === 0) return counts;
  const rows = await db
    .select({
      eventId: eventAttendee.eventId,
      status: eventAttendee.status,
      people: sql<number>`count(*)::int`,
      guests: sql<number>`coalesce(sum(${eventAttendee.guestCount}), 0)::int`,
    })
    .from(eventAttendee)
    .where(inArray(eventAttendee.eventId, eventIds))
    .groupBy(eventAttendee.eventId, eventAttendee.status);
  for (const row of rows) {
    const current = counts.get(row.eventId) ?? { going: 0, maybe: 0 };
    if (row.status === "going") current.going += row.people + row.guests;
    if (row.status === "maybe") current.maybe += row.people;
    counts.set(row.eventId, current);
  }
  return counts;
}

/** How many attendee avatars an event card stacks (mobile contract: AgendaItem.attendeePreview). */
export const ATTENDEE_PREVIEW_SIZE = 4;

export type UserPreview = { id: string; name: string; image: string | null };

/**
 * An event as a card (mobile contract: AgendaItem) — used wherever an event is embedded rather than
 * opened: a post that links an event, a tribe's next event, and the agenda. Counts come from
 * `rsvpCountsFor`, so `goingCount` includes guests exactly as the event detail does.
 *
 * Deliberately narrower than `Event` (TRI-161): the card draws the one open poll, not a poll count,
 * and never a capacity line, so `pollCount` and the settings slice stay on `Event`. `commentCount`
 * is on both because both screens draw it.
 */
export type AgendaItemPreview = {
  id: string;
  tribe: { id: string; name: string; avatar: string | null; color: string | null };
  title: string;
  location: string | null;
  coverImageUrl: string | null;
  startDate: Date;
  endDate: Date | null;
  status: (typeof event.$inferSelect)["status"];
  goingCount: number;
  maybeCount: number;
  myRsvp: string | null;
  host: UserPreview;
  // The first ATTENDEE_PREVIEW_SIZE members going, in RSVP order (avatar stack)
  attendeePreview: UserPreview[];
  // The oldest poll on the event that has not closed, or null
  openPoll: { id: string; question: string; endsAt: Date | null } | null;
  commentCount: number;
};

/**
 * Event cards for a set of event ids, keyed by event id. A constant number of queries for any
 * number of events.
 */
export async function getAgendaItems(
  eventIds: string[],
  currentUserId?: string
): Promise<Map<string, AgendaItemPreview>> {
  const previews = new Map<string, AgendaItemPreview>();
  if (eventIds.length === 0) return previews;

  // Going RSVPs numbered per event, oldest first, so the preview is stable as people join
  const rankedGoing = db
    .select({
      eventId: eventAttendee.eventId,
      userId: eventAttendee.userId,
      rank: sql<number>`row_number() over (partition by ${eventAttendee.eventId} order by ${eventAttendee.createdAt}, ${eventAttendee.id})`.as("rank"),
    })
    .from(eventAttendee)
    // The avatar stack skips a blocked pair (TRI-238); goingCount still counts them
    .where(
      and(
        inArray(eventAttendee.eventId, eventIds),
        eq(eventAttendee.status, "going"),
        excludeBlocked(currentUserId, eventAttendee.userId)
      )
    )
    .as("ranked_going");

  const [events, counts, myRsvps, previewRows, openPolls, commentCounts] = await Promise.all([
    db
      .select({
        id: event.id,
        title: event.title,
        location: event.location,
        coverImageUrl: event.coverImageUrl,
        startDate: event.startDate,
        endDate: event.endDate,
        status: effectiveEventStatus,
        tribeId: tribe.id,
        tribeName: tribe.name,
        tribeAvatarUrl: media.fileUrl,
        tribeColor: tribe.color,
        host: userPreviewColumns,
      })
      .from(event)
      .innerJoin(tribe, eq(event.tribeId, tribe.id))
      .innerJoin(user, eq(event.createdBy, user.id))
      .leftJoin(media, eq(tribe.avatar, media.id))
      .where(inArray(event.id, eventIds)),
    rsvpCountsFor(eventIds),
    currentUserId
      ? db
        .select({ eventId: eventAttendee.eventId, status: eventAttendee.status })
        .from(eventAttendee)
        .where(and(inArray(eventAttendee.eventId, eventIds), eq(eventAttendee.userId, currentUserId)))
      : Promise.resolve([]),
    db
      .select({ eventId: rankedGoing.eventId, rank: rankedGoing.rank, user: userPreviewColumns })
      .from(rankedGoing)
      .innerJoin(user, eq(rankedGoing.userId, user.id))
      .where(lte(rankedGoing.rank, ATTENDEE_PREVIEW_SIZE))
      .orderBy(asc(rankedGoing.eventId), asc(rankedGoing.rank)),
    db
      .selectDistinctOn([poll.eventId], {
        eventId: poll.eventId,
        id: poll.id,
        question: poll.question,
        endsAt: poll.endsAt,
      })
      .from(poll)
      .where(
        and(
          inArray(poll.eventId, eventIds),
          or(isNull(poll.endsAt), gt(poll.endsAt, sql`now()`))
        )
      )
      .orderBy(poll.eventId, asc(poll.createdAt)),
    db
      .select({ eventId: comment.eventId, count: sql<number>`count(*)::int` })
      .from(comment)
      .where(inArray(comment.eventId, eventIds))
      .groupBy(comment.eventId),
  ]);

  const myRsvpMap = new Map(myRsvps.map((r) => [r.eventId, r.status]));
  const previewMap = new Map<string, UserPreview[]>();
  for (const row of previewRows) {
    const list = previewMap.get(row.eventId) ?? [];
    list.push(row.user);
    previewMap.set(row.eventId, list);
  }
  const openPollMap = new Map(
    openPolls.map((p) => [p.eventId as string, { id: p.id, question: p.question, endsAt: p.endsAt }])
  );
  const commentCountMap = new Map(commentCounts.map((c) => [c.eventId as string, c.count]));

  for (const e of events) {
    previews.set(e.id, {
      id: e.id,
      tribe: { id: e.tribeId, name: e.tribeName, avatar: e.tribeAvatarUrl || null, color: e.tribeColor ?? null },
      title: e.title,
      location: e.location,
      coverImageUrl: e.coverImageUrl,
      startDate: e.startDate,
      endDate: e.endDate,
      status: e.status,
      goingCount: counts.get(e.id)?.going ?? 0,
      maybeCount: counts.get(e.id)?.maybe ?? 0,
      myRsvp: myRsvpMap.get(e.id) ?? null,
      host: e.host,
      attendeePreview: previewMap.get(e.id) ?? [],
      openPoll: openPollMap.get(e.id) ?? null,
      commentCount: commentCountMap.get(e.id) ?? 0,
    });
  }

  return previews;
}

type CreateEventPollData = {
  question: string;
  options: string[];
  allowMultiple: boolean;
  isAnonymous: boolean;
  endsAt?: Date;
};

/**
 * Create a new event (with optional poll)
 * IMPORTANT: Check permissions before calling
 */
export async function createEvent(
  tribeId: string,
  userId: string,
  data: {
    title: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    location?: string;
    coverImageUrl?: string | null;
    poll?: CreateEventPollData;
  }
): Promise<EventWithDetails> {
  const dbTx = getDbTransaction();

  // Use transaction for event + poll creation
  const created = await dbTx.transaction(async (tx) => {
    // 1. Create event
    const [newEvent] = await tx
      .insert(event)
      .values({
        tribeId,
        createdBy: userId,
        title: data.title,
        description: data.description || null,
        startDate: data.startDate,
        endDate: data.endDate || null,
        location: data.location || null,
        coverImageUrl: data.coverImageUrl || null,
        status: "upcoming",
      })
      .returning();

    // 2. Create poll if provided
    if (data.poll) {
      const [newPoll] = await tx
        .insert(poll)
        .values({
          eventId: newEvent.id,
          createdBy: userId,
          question: data.poll.question,
          allowMultiple: data.poll.allowMultiple,
          isAnonymous: data.poll.isAnonymous,
          endsAt: data.poll.endsAt || null,
        })
        .returning();

      // 3. Create poll options
      const optionValues = data.poll.options.map((text, index) => ({
        pollId: newPoll.id,
        text,
        order: index,
      }));

      await tx.insert(pollOption).values(optionValues);
    }

    // 4. Create activity (within transaction)
    await tx.insert(activity).values({
      type: "event",
      userId,
      tribeId,
      eventId: newEvent.id,
      action: "created",
      preview: newEvent.title,
    });

    await tx.insert(eventAttendee).values({
      eventId: newEvent.id,
      userId,
      status: "going",
    });

    // TRI-192: members hear about new events through one collapsing "new events" row per tribe
    await notify(tx, {
      type: "new_event",
      actorId: userId,
      tribeId,
      entityType: "tribe",
      entityId: tribeId,
      recipients: await tribeMemberIds(tx, tribeId),
      title: "created an event",
      message: newEvent.title,
      link: appLink.event(tribeId, newEvent.id),
      collapse: true,
    });

    // 5. Fetch event with creator info
    const [eventWithCreator] = await tx
      .select({
        id: event.id,
        tribeId: event.tribeId,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        status: effectiveEventStatus,
        createdBy: event.createdBy,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        creator: userPreviewColumns,
        tribe: {
          id: tribe.id,
          name: tribe.name,
          description: tribe.description,
          avatar: tribe.avatar,
          location: tribe.location,
          privacy: tribe.privacy,
          category: tribe.category,
          isFeatured: tribe.isFeatured,
          isTrending: tribe.isTrending,
          featuredMediaId: tribe.featuredMediaId,
          createdBy: tribe.createdBy,
          createdAt: tribe.createdAt,
          updatedAt: tribe.updatedAt,
        },
      })
      .from(event)
      .innerJoin(user, eq(event.createdBy, user.id))
      .innerJoin(tribe, eq(event.tribeId, tribe.id))
      .where(eq(event.id, newEvent.id))
      .limit(1);

    return eventWithCreator as EventWithCreator;
  });

  // Re-read through the detail path so POST answers the contract's full `Event` (counts, the
  // creator's own RSVP, the settings slice) rather than a bare row — the client caches it as one.
  return (await getEventById(created.id, userId)) ?? (created as EventWithDetails);
}

/**
 * Get all events for a tribe
 * OPTIMIZED: Single query with join
 */
type EventListOptions = {
  status?: "upcoming" | "ongoing" | "completed" | "cancelled";
  limit?: number;
  offset?: number;
  userId?: string;
};

export async function getTribeEvents(
  tribeId: string,
  options?: EventListOptions
): Promise<EventWithDetails[]> {
  return listEvents(eq(event.tribeId, tribeId), options);
}

/**
 * Events a member hosts (creator or co-host) in the given tribes, in the tribe list's shape and order
 * (PROF-02 Events tab, TRI-15). The caller decides which tribes the viewer may see.
 */
export async function getEventsHostedBy(
  hostId: string,
  tribeIds: string[],
  options?: EventListOptions
): Promise<EventWithDetails[]> {
  if (tribeIds.length === 0) return [];
  return listEvents(and(inArray(event.tribeId, tribeIds), hostedBy(hostId))!, options);
}

/** Events a member hosts in the given tribes: the count behind `MemberProfile.counts.events`. */
export async function countEventsHostedBy(hostId: string, tribeIds: string[]): Promise<number> {
  if (tribeIds.length === 0) return 0;
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(event)
    .where(and(inArray(event.tribeId, tribeIds), hostedBy(hostId)));
  return row?.n ?? 0;
}

function hostedBy(userId: string): SQL {
  return or(
    eq(event.createdBy, userId),
    exists(
      db
        .select({ one: sql`1` })
        .from(eventCoHost)
        .where(and(eq(eventCoHost.eventId, event.id), eq(eventCoHost.userId, userId)))
    )
  )!;
}

async function listEvents(scope: SQL, options?: EventListOptions): Promise<EventWithDetails[]> {
  // Main query; RSVP counts are attached afterwards from event_attendee (TRI-10)
  const baseSelect = db
    .select({
      id: event.id,
      tribeId: event.tribeId,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      coverImageUrl: event.coverImageUrl,
      status: effectiveEventStatus,
      createdBy: event.createdBy,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      creator: userPreviewColumns,
      tribe: {
        id: tribe.id,
        name: tribe.name,
        description: tribe.description,
        avatar: tribe.avatar,
        location: tribe.location,
        privacy: tribe.privacy,
        category: tribe.category,
        isFeatured: tribe.isFeatured,
        isTrending: tribe.isTrending,
        featuredMediaId: tribe.featuredMediaId,
        createdBy: tribe.createdBy,
        createdAt: tribe.createdAt,
        updatedAt: tribe.updatedAt,
      },
    })
    .from(event)
    .innerJoin(user, eq(event.createdBy, user.id))
    .innerJoin(tribe, eq(event.tribeId, tribe.id))
    .$dynamic();

  const conditions = options?.status
    ? and(scope, sql`${effectiveEventStatus} = ${options.status}`)
    : scope;

  let query = baseSelect.where(conditions).orderBy(desc(event.startDate));

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.offset(options.offset);
  }

  const events = await query;
  const eventIds = events.map((e) => e.id);

  // Everything else is per page, not per row: RSVP counts, the caller's own RSVP, the RSVP rules
  // slice of event_settings and the poll/comment counts (TRI-161, for the EVT-16 preview sheet).
  const [counts, myRows, rules, eventCounts] = await Promise.all([
    rsvpCountsFor(eventIds),
    // The caller's own status per event (contract `myRsvp`; `isUserAttending` kept for the web app)
    options?.userId && eventIds.length > 0
      ? db
        .select({ eventId: eventAttendee.eventId, status: eventAttendee.status })
        .from(eventAttendee)
        .where(
          and(
            inArray(eventAttendee.eventId, eventIds),
            eq(eventAttendee.userId, options.userId)
          )
        )
      : Promise.resolve([]),
    rsvpRulesForMany(eventIds),
    eventCountsFor(eventIds),
  ]);
  const mine = new Map<string, RsvpStatus>(myRows.map((row) => [row.eventId, row.status]));

  return events.map((event) => {
    const status = mine.get(event.id) ?? null;
    const eventRules = rules.get(event.id) ?? DEFAULT_RSVP_RULES;
    return {
      ...event,
      attendees: [], // Empty array for list view
      attendeeCount: counts.get(event.id)?.going ?? 0,
      maybeCount: counts.get(event.id)?.maybe ?? 0,
      myRsvp: options?.userId ? status : undefined,
      isUserAttending: options?.userId ? status === "going" : undefined,
      pollCount: eventCounts.get(event.id)?.pollCount ?? 0,
      commentCount: eventCounts.get(event.id)?.commentCount ?? 0,
      // Same flat settings slice as the detail, so a card can show "full" without a second call
      guestAllowance: eventRules.guestAllowance,
      waitlistEnabled: eventRules.waitlistEnabled,
      capacityLimit: eventRules.capacityLimit,
      rsvpDeadline: eventRules.rsvpDeadline,
      attendeeVisibility: eventRules.attendeeVisibility,
    };
  }) as unknown as EventWithDetails[];
}

/**
 * Get single event by ID with attendee info
 * OPTIMIZED: Parallel queries for event data and attendee count
 */
export async function getEventById(
  eventId: string,
  userId?: string
): Promise<EventWithDetails | null> {
  const [eventData, counts, userAttendance, rules, eventCounts, agenda] = await Promise.all([
    // Event with creator
    db
      .select({
        id: event.id,
        tribeId: event.tribeId,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        coverImageUrl: event.coverImageUrl,
        status: effectiveEventStatus,
        createdBy: event.createdBy,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        creator: userPreviewColumns,
        tribe: {
          id: tribe.id,
          name: tribe.name,
          description: tribe.description,
          avatar: tribe.avatar,
          location: tribe.location,
          privacy: tribe.privacy,
          category: tribe.category,
          isFeatured: tribe.isFeatured,
          isTrending: tribe.isTrending,
          featuredMediaId: tribe.featuredMediaId,
          createdBy: tribe.createdBy,
          createdAt: tribe.createdAt,
          updatedAt: tribe.updatedAt,
        },
      })
      .from(event)
      .innerJoin(user, eq(event.createdBy, user.id))
      .innerJoin(tribe, eq(event.tribeId, tribe.id))
      .where(eq(event.id, eventId))
      .limit(1),

    // Going (people + guests) and maybe counts
    rsvpCountsFor([eventId]),

    // User attendance status
    userId
      ? db
        .select()
        .from(eventAttendee)
        .where(
          and(
            eq(eventAttendee.eventId, eventId),
            eq(eventAttendee.userId, userId)
          )
        )
        .limit(1)
      : Promise.resolve([]),

    // Guest allowance, capacity and waitlist for the RSVP sheet (defaults when no settings row)
    rsvpRulesFor(eventId),

    // Poll and comment counts for the preview sheet (TRI-161)
    eventCountsFor([eventId]),

    // The going avatars EVT-02 stacks, same as Home's agenda card (TRI-259)
    getAgendaItems([eventId], userId),
  ]);

  if (!eventData[0]) return null;
  const mine = userAttendance[0];

  return {
    ...eventData[0],
    attendeeCount: counts.get(eventId)?.going ?? 0,
    maybeCount: counts.get(eventId)?.maybe ?? 0,
    myRsvp: userId ? (mine?.status ?? null) : undefined,
    isUserAttending: mine?.status === "going",
    pollCount: eventCounts.get(eventId)?.pollCount ?? 0,
    commentCount: eventCounts.get(eventId)?.commentCount ?? 0,
    guestAllowance: rules.guestAllowance,
    waitlistEnabled: rules.waitlistEnabled,
    capacityLimit: rules.capacityLimit,
    rsvpDeadline: rules.rsvpDeadline,
    // EVT-17: who may see the list (all members / count only / hidden)
    attendeeVisibility: rules.attendeeVisibility,
    attendees: [], // Fetch separately if needed
    // Hidden unless the list itself is visible to members; the creator always sees it (TRI-259)
    attendeePreview:
      rules.attendeeVisibility === "all_members" || eventData[0].createdBy === userId
        ? (agenda.get(eventId)?.attendeePreview ?? [])
        : [],
  } as unknown as EventWithDetails;
}

type EventChangeRow = Pick<Event, "id" | "tribeId" | "title" | "startDate" | "endDate" | "location" | "status">;

/**
 * TRI-191: what attendees hear about an edit. Cancel wins over a new time, a new time over a new place; title and
 * description edits say nothing. Events that are over (or already cancelled) notify nobody.
 */
export function eventChangeNotice(before: EventChangeRow, after: EventChangeRow) {
  const over = (row: EventChangeRow) => (row.endDate ?? row.startDate).getTime() < Date.now();
  if (before.status === "cancelled" || over(before)) return null;
  if (after.status === "cancelled") return { kind: "cancelled", title: `cancelled ${after.title}` } as const;
  const sameTime = (x: Date | null, y: Date | null) => (x?.getTime() ?? null) === (y?.getTime() ?? null);
  if (!sameTime(before.startDate, after.startDate) || !sameTime(before.endDate, after.endDate)) {
    return { kind: "rescheduled", title: `changed the time of ${after.title}` } as const;
  }
  if ((before.location ?? null) !== (after.location ?? null)) {
    return { kind: "changed", title: `changed the location of ${after.title}` } as const;
  }
  return null;
}

/** Going + maybe attendees and the hosts (creator, co-hosts); `notify()` drops the actor. */
async function eventAudience(executor: NotifyExecutor, eventId: string) {
  return [...(await eventAttendeeIds(executor, eventId)), ...(await eventHostIds(executor, eventId))];
}

/**
 * Update event
 * IMPORTANT: Check permissions before calling
 */
export async function updateEvent(
  eventId: string,
  userId: string,
  data: Partial<{
    title: string;
    description: string | null;
    startDate: Date;
    endDate: Date | null;
    location: string | null;
    coverImageUrl: string | null;
    status: "upcoming" | "ongoing" | "completed" | "cancelled";
  }>
): Promise<EventWithCreator | null> {
  // The edit and its notification commit together (TRI-183)
  const updated = await getDbTransaction().transaction(async (tx) => {
    const [before] = await tx.select().from(event).where(eq(event.id, eventId)).for("update");
    if (!before) return null;
    const [after] = await tx
      .update(event)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(event.id, eventId))
      .returning();

    const notice = eventChangeNotice(before, after);
    if (notice) {
      await notify(tx, {
        type: "event_update",
        actorId: userId,
        tribeId: after.tribeId,
        entityType: "event",
        entityId: after.id,
        recipients: await eventAudience(tx, after.id),
        title: notice.title,
        message: "",
        link: appLink.event(after.tribeId, after.id),
        // Repeat edits of one kind collapse; cancel, reschedule and change never merge with each other
        collapse: notice.kind,
      });
    }
    return after;
  });

  if (!updated) return null;

  // Create activity
  await createActivity({
    type: "event",
    userId,
    tribeId: updated.tribeId,
    eventId: updated.id,
    action: "updated",
    preview: updated.title,
  });

  // Fetch with creator
  return (await getEventById(eventId)) as EventWithCreator;
}

/**
 * Delete event
 * IMPORTANT: Check permissions before calling
 * TRI-191: attendees of an upcoming, not yet cancelled event hear it was cancelled, in the same transaction. The
 * row links to the tribe, since the event is gone.
 */
export async function deleteEvent(eventId: string, userId: string): Promise<boolean> {
  return getDbTransaction().transaction(async (tx) => {
    const [row] = await tx.select().from(event).where(eq(event.id, eventId)).for("update");
    if (!row) return false;
    if (eventChangeNotice(row, { ...row, status: "cancelled" })) {
      await notify(tx, {
        type: "event_update",
        actorId: userId,
        tribeId: row.tribeId,
        entityType: "event",
        entityId: row.id,
        recipients: await eventAudience(tx, row.id),
        title: `cancelled ${row.title}`,
        message: "",
        link: appLink.tribe(row.tribeId),
        collapse: "cancelled",
      });
    }
    const result = await tx.delete(event).where(eq(event.id, eventId));
    return (result.rowCount ?? 0) > 0;
  });
}

/**
 * TRI-188: the first line hosts read after the attendee's name, or null when there is nothing to say. Only a
 * change of answer counts (a guest-count or note edit says nothing); a first "can't go" is not news, dropping
 * out is.
 */
export function rsvpNoticeTitle(previous: RsvpStatus | null, next: RsvpStatus | null, eventTitle: string) {
  if (previous === next) return null;
  const wasIn = previous === "going" || previous === "maybe";
  if (next === "going") return `is going to ${eventTitle}`;
  if (next === "maybe") return `might go to ${eventTitle}`;
  if (next === "not_going") return wasIn ? `can't go to ${eventTitle}` : null;
  return wasIn ? `is no longer going to ${eventTitle}` : null;
}

/** EVT-11 "RSVP changes": the event's own setting, else the tribe default, else on. */
async function hostsWantRsvpNotices(executor: NotifyExecutor, eventId: string, tribeId: string) {
  const [own] = await executor
    .select({ on: eventSettings.notifyOnRsvpChanges })
    .from(eventSettings)
    .where(eq(eventSettings.eventId, eventId));
  if (own) return own.on ?? true;
  const [tribeDefault] = await executor
    .select({ on: tribeSettings.notifyOnRsvpChanges })
    .from(tribeSettings)
    .where(eq(tribeSettings.tribeId, tribeId));
  return tribeDefault?.on ?? true;
}

/**
 * RSVP changes to the creator and co-hosts (TRI-188). A host's own RSVP notifies nobody (`notify()` drops the
 * actor). All RSVPs to one event collapse into each host's unread row. Off when the event's "RSVP changes"
 * setting is off: that setting is the hosts' "don't notify me at all", so no row (owner, 2026-09-24).
 */
async function notifyHostsOfRsvp(
  executor: NotifyExecutor,
  eventId: string,
  userId: string,
  previous: RsvpStatus | null,
  next: RsvpStatus | null,
  guestCount: number
) {
  const [row] = await executor
    .select({ id: event.id, tribeId: event.tribeId, title: event.title, status: event.status })
    .from(event)
    .where(eq(event.id, eventId));
  if (!row || row.status === "cancelled") return;
  const title = rsvpNoticeTitle(previous, next, row.title);
  if (!title || !(await hostsWantRsvpNotices(executor, eventId, row.tribeId))) return;
  await notify(executor, {
    type: "rsvp",
    actorId: userId,
    tribeId: row.tribeId,
    entityType: "event",
    entityId: row.id,
    recipients: await eventHostIds(executor, row.id),
    title,
    message: guestCount > 0 ? `+${guestCount} guest${guestCount === 1 ? "" : "s"}` : "",
    link: appLink.event(row.tribeId, row.id),
    collapse: true,
  });
}

/**
 * Add attendee (RSVP)
 */
export async function addEventAttendee(
  eventId: string,
  userId: string,
  input: RsvpStatus | { status: RsvpStatus; guestCount?: number; note?: string } = "going"
): Promise<void> {
  const { status, guestCount: requested = 0, note } =
    typeof input === "string" ? { status: input, guestCount: 0, note: undefined } : input;
  const rules = await rsvpRulesFor(eventId);
  // Guests only count when going; the allowance caps them rather than refusing the RSVP.
  const guestCount = status === "going" ? Math.min(Math.max(0, requested), rules.guestAllowance) : 0;

  // Capacity: what everyone else going already takes, plus this RSVP with its guests.
  if (status === "going" && rules.capacityLimit !== null) {
    const [others] = await db
      .select({
        taken: sql<number>`coalesce(sum(1 + ${eventAttendee.guestCount}), 0)::int`,
      })
      .from(eventAttendee)
      .where(
        and(
          eq(eventAttendee.eventId, eventId),
          eq(eventAttendee.status, "going"),
          sql`${eventAttendee.userId} <> ${userId}`
        )
      );
    if ((others?.taken ?? 0) + 1 + guestCount > rules.capacityLimit) {
      // Waitlist semantics land with event settings (TRI-13); until then a full event refuses.
      throw new EventFullError(false);
    }
  }

  // Upsert and tell the hosts in one transaction (TRI-188)
  await getDbTransaction().transaction(async (tx) => {
    const [previous] = await tx
      .select({ status: eventAttendee.status })
      .from(eventAttendee)
      .where(and(eq(eventAttendee.eventId, eventId), eq(eventAttendee.userId, userId)))
      .for("update");
    await tx
      .insert(eventAttendee)
      .values({
        eventId,
        userId,
        status,
        guestCount,
        note: note?.trim() ? note.trim() : null,
      })
      .onConflictDoUpdate({
        target: [eventAttendee.eventId, eventAttendee.userId],
        set: { status, guestCount, note: note?.trim() ? note.trim() : null, updatedAt: new Date() },
      });
    await notifyHostsOfRsvp(tx, eventId, userId, previous?.status ?? null, status, guestCount);
  });

  // Get event for activity
  const eventData = await db
    .select()
    .from(event)
    .where(eq(event.id, eventId))
    .limit(1);

  if (eventData[0]) {
    await createActivity({
      type: "event",
      userId,
      tribeId: eventData[0].tribeId,
      eventId,
      action: "rsvp",
      preview: `RSVP: ${status}`,
    });
  }
}

/**
 * Remove attendee
 */
export async function removeEventAttendee(
  eventId: string,
  userId: string
): Promise<void> {
  await getDbTransaction().transaction(async (tx) => {
    const [removed] = await tx
      .delete(eventAttendee)
      .where(and(eq(eventAttendee.eventId, eventId), eq(eventAttendee.userId, userId)))
      .returning({ status: eventAttendee.status });
    if (removed) await notifyHostsOfRsvp(tx, eventId, userId, removed.status, null, 0);
  });
}

/**
 * Remove multiple attendees
 */
export async function removeMultipleEventAttendees(eventId: string, userIds: string[]): Promise<void> {
  await db
    .delete(eventAttendee)
    .where(
      and(
        eq(eventAttendee.eventId, eventId),
        inArray(eventAttendee.userId, userIds)
      )
    );
}

/**
 * Get all attendees for an event with user details
 * Ordered by status (going, maybe, not_going) and creation date
 */
export async function getEventAttendees(eventId: string, viewerId?: string): Promise<EventAttendeeWithUser[]> {
  const attendees = await db
    .select({
      id: eventAttendee.id,
      eventId: eventAttendee.eventId,
      userId: eventAttendee.userId,
      status: eventAttendee.status,
      guestCount: eventAttendee.guestCount,
      note: eventAttendee.note,
      createdAt: eventAttendee.createdAt,
      updatedAt: eventAttendee.updatedAt,
      // The creator and co-hosts (TRI-13) are hosts; EVT-17 labels and orders them (TRI-291)
      isHost: sql<boolean>`(${event.createdBy} = ${eventAttendee.userId} OR EXISTS (
        SELECT 1 FROM ${eventCoHost}
        WHERE ${eventCoHost.eventId} = ${eventAttendee.eventId} AND ${eventCoHost.userId} = ${eventAttendee.userId}
      ))`,
      user: userWithUsernameColumns,
    })
    .from(eventAttendee)
    .innerJoin(user, eq(eventAttendee.userId, user.id))
    .innerJoin(event, eq(eventAttendee.eventId, event.id))
    // A blocked pair's RSVP rows are left out (TRI-238)
    .where(and(eq(eventAttendee.eventId, eventId), excludeBlocked(viewerId, eventAttendee.userId)))
    .orderBy(
      sql`CASE ${eventAttendee.status} WHEN 'going' THEN 1 WHEN 'maybe' THEN 2 WHEN 'not_going' THEN 3 ELSE 4 END`,
      asc(eventAttendee.createdAt)
    );

  return attendees as EventAttendeeWithUser[];
}