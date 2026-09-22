import { db, getDbTransaction } from "@/lib/database/client";
import { event, eventAttendee, eventSettings } from "@/lib/database/schemas/event";
import { user } from "@/lib/database/schemas/auth";
import { tribe } from "@/lib/database/schemas/tribe";
import { media } from "@/lib/database/schemas/media";
import { poll, pollOption } from "@/lib/database/schemas/poll";
import { comment } from "@/lib/database/schemas/post";
import { activity } from "@/lib/database/schemas/activity";
import { eq, and, desc, sql, inArray, asc, or, isNull, gt, lte } from "drizzle-orm";
import { createActivity } from "./activity";
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

// event_settings is created lazily by the web app, so most events have no row: these are the defaults.
async function rsvpRulesFor(eventId: string): Promise<RsvpRules> {
  const [row] = await db
    .select({
      guestAllowance: eventSettings.guestAllowance,
      capacityLimit: eventSettings.capacityLimit,
      enableWaitlist: eventSettings.enableWaitlist,
      rsvpDeadline: eventSettings.rsvpDeadline,
      attendeeVisibility: eventSettings.attendeeVisibility,
    })
    .from(eventSettings)
    .where(eq(eventSettings.eventId, eventId))
    .limit(1);
  return {
    guestAllowance: row?.guestAllowance ?? 0,
    capacityLimit: row?.capacityLimit ?? null,
    waitlistEnabled: row?.enableWaitlist ?? true,
    rsvpDeadline: row?.rsvpDeadline ?? null,
    attendeeVisibility: row?.attendeeVisibility ?? "all_members",
  };
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
    .where(and(inArray(eventAttendee.eventId, eventIds), eq(eventAttendee.status, "going")))
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
        status: event.status,
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
): Promise<EventWithCreator> {
  const dbTx = getDbTransaction();

  // Use transaction for event + poll creation
  return await dbTx.transaction(async (tx) => {
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
        status: event.status,
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
}

/**
 * Get all events for a tribe
 * OPTIMIZED: Single query with join
 */
export async function getTribeEvents(
  tribeId: string,
  options?: {
    status?: "upcoming" | "ongoing" | "completed" | "cancelled";
    limit?: number;
    offset?: number;
    userId?: string;
  }
): Promise<EventWithDetails[]> {
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
      status: event.status,
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
    ? and(eq(event.tribeId, tribeId), eq(event.status, options.status))
    : eq(event.tribeId, tribeId);

  let query = baseSelect.where(conditions).orderBy(desc(event.startDate));

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.offset(options.offset);
  }

  const events = await query;
  const eventIds = events.map((e) => e.id);
  const counts = await rsvpCountsFor(eventIds);

  // The caller's own status per event (contract `myRsvp`; `isUserAttending` kept for the web app)
  const mine = new Map<string, RsvpStatus>();
  if (options?.userId && eventIds.length > 0) {
    const rows = await db
      .select({ eventId: eventAttendee.eventId, status: eventAttendee.status })
      .from(eventAttendee)
      .where(
        and(
          inArray(eventAttendee.eventId, eventIds),
          eq(eventAttendee.userId, options.userId)
        )
      );
    for (const row of rows) mine.set(row.eventId, row.status);
  }

  return events.map((event) => {
    const status = mine.get(event.id) ?? null;
    return {
      ...event,
      attendees: [], // Empty array for list view
      attendeeCount: counts.get(event.id)?.going ?? 0,
      maybeCount: counts.get(event.id)?.maybe ?? 0,
      myRsvp: options?.userId ? status : undefined,
      isUserAttending: options?.userId ? status === "going" : undefined,
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
  const [eventData, counts, userAttendance, rules] = await Promise.all([
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
        status: event.status,
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
  ]);

  if (!eventData[0]) return null;
  const mine = userAttendance[0];

  return {
    ...eventData[0],
    attendeeCount: counts.get(eventId)?.going ?? 0,
    maybeCount: counts.get(eventId)?.maybe ?? 0,
    myRsvp: userId ? (mine?.status ?? null) : undefined,
    isUserAttending: mine?.status === "going",
    guestAllowance: rules.guestAllowance,
    waitlistEnabled: rules.waitlistEnabled,
    capacityLimit: rules.capacityLimit,
    rsvpDeadline: rules.rsvpDeadline,
    // EVT-17: who may see the list (all members / count only / hidden)
    attendeeVisibility: rules.attendeeVisibility,
    attendees: [], // Fetch separately if needed
  } as unknown as EventWithDetails;
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
  const [updated] = await db
    .update(event)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(event.id, eventId))
    .returning();

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
 */
export async function deleteEvent(eventId: string): Promise<boolean> {
  const result = await db.delete(event).where(eq(event.id, eventId));
  return (result.rowCount ?? 0) > 0;
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

  // Upsert pattern: insert or update if exists
  await db
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
  await db
    .delete(eventAttendee)
    .where(
      and(
        eq(eventAttendee.eventId, eventId),
        eq(eventAttendee.userId, userId)
      )
    );
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
export async function getEventAttendees(eventId: string): Promise<EventAttendeeWithUser[]> {
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
      user: userWithUsernameColumns,
    })
    .from(eventAttendee)
    .innerJoin(user, eq(eventAttendee.userId, user.id))
    .where(eq(eventAttendee.eventId, eventId))
    .orderBy(
      sql`CASE ${eventAttendee.status} WHEN 'going' THEN 1 WHEN 'maybe' THEN 2 WHEN 'not_going' THEN 3 ELSE 4 END`,
      asc(eventAttendee.createdAt)
    );

  return attendees as EventAttendeeWithUser[];
}