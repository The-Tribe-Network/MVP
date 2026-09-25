import { db } from "@/lib/database/client";
import { event, eventAttendee } from "@/lib/database/schemas/event";
import { poll } from "@/lib/database/schemas/poll";
import { post, postLike } from "@/lib/database/schemas/post";
import { tribe, tribeMember, tribeMemberPreference } from "@/lib/database/schemas/tribe";
import { user } from "@/lib/database/schemas/auth";
import { media } from "@/lib/database/schemas/media";
import { and, asc, desc, eq, gt, gte, inArray, lte, ne, or, sql, type AnyColumn, type SQL } from "drizzle-orm";
import { userPreviewColumns } from "@/lib/database/user-columns";
import { effectiveEventStatus, getAgendaItems, type AgendaItemPreview, type UserPreview } from "./event";
import { getPostsByIds, type PostWithMetadata } from "./post";
import { CATCH_UP_FALLBACK_DAYS, getUnreadPostCounts } from "./tribe";
import { excludeBlocked } from "./blocks";

/**
 * Cross-tribe reads for Home (mobile contract `getAgenda`, `getCatchUp`; DATA-MODEL-DELTA §4).
 * Every function here runs a constant number of queries however many tribes the caller is in.
 */

export type TribeRef = { id: string; name: string; avatar: string | null; color: string | null };

export type AgendaParams = { from: Date; to: Date; tribeId?: string; limit: number };

/**
 * Events across the caller's tribes starting in [from, to], soonest first. Cancelled events are
 * left out (the calendar and "This week" show what is happening, and the tribe list's `nextEvent`
 * already skips them); `tribeId` narrows to one tribe and yields nothing for a tribe the caller is
 * not in.
 */
export async function getAgenda(userId: string, params: AgendaParams): Promise<AgendaItemPreview[]> {
  const conditions: SQL[] = [
    eq(tribeMember.userId, userId),
    gte(event.startDate, params.from),
    lte(event.startDate, params.to),
    ne(event.status, "cancelled"),
  ];
  if (params.tribeId) conditions.push(eq(event.tribeId, params.tribeId));

  const rows = await db
    .select({ id: event.id })
    .from(event)
    .innerJoin(tribeMember, eq(tribeMember.tribeId, event.tribeId))
    .where(and(...conditions))
    .orderBy(asc(event.startDate), asc(event.id))
    .limit(params.limit);

  const items = await getAgendaItems(rows.map((r) => r.id), userId);
  return rows.flatMap((r) => items.get(r.id) ?? []);
}

export type CatchUpKind = "post" | "poll" | "event_rsvps" | "member_joined" | "album_added";
export type CatchUpReason = "pinned" | "mention" | "popular" | "closes_soon" | "new_rsvps" | "joined";

export type CatchUpItem = {
  id: string;
  kind: CatchUpKind;
  tribe: TribeRef;
  actor: UserPreview | null;
  reasons: CatchUpReason[];
  post: (PostWithMetadata & { tribe: TribeRef }) | null;
  event: AgendaItemPreview | null;
  createdAt: Date;
};

export type TribeUnreadSummary = TribeRef & { unreadCount: number };

export type CatchUpParams = { since?: Date; tribeId?: string; cursor?: string; limit: number };

export type CatchUpPage = {
  items: CatchUpItem[];
  tribes: TribeUnreadSummary[];
  nextCursor: string | null;
};

// A post with at least this many likes is "popular"
const POPULAR_LIKES = 3;
// Polls closing within this window are "closes soon", whatever `since` is
const CLOSES_SOON_HOURS = 48;
// Each source is capped so a busy tribe cannot make the page unbounded
const SOURCE_CAP = 200;

// Ranking: what the member most likely wants to see first, then newest first within a tier
const TIER: Record<CatchUpReason, number> = {
  pinned: 0,
  mention: 1,
  closes_soon: 2,
  popular: 3,
  new_rsvps: 4,
  joined: 5,
};
const PLAIN_TIER = 6;

const encodeCursor = (offset: number) => Buffer.from(`offset:${offset}`).toString("base64url");
const decodeCursor = (cursor: string | undefined): number => {
  if (!cursor) return 0;
  const match = /^offset:(\d+)$/.exec(Buffer.from(cursor, "base64url").toString());
  return match ? Number(match[1]) : 0;
};

/**
 * What happened across the caller's tribes since they last caught up (HOME-03, HOME-01 "Catch up"):
 * posts by others, polls closing within 48 h, events that gained RSVPs and members who joined.
 *
 * `since` applies to every tribe when given; otherwise each tribe uses its own
 * `tribe_member_preference.last_catch_up_at`, falling back to the last CATCH_UP_FALLBACK_DAYS,
 * and never earlier than the caller joined. `tribes` carries the unread post count per tribe the
 * same way `GET /tribes` does. Pagination is offset-based (the ranking is recomputed per page).
 */
export async function getCatchUp(userId: string, params: CatchUpParams): Promise<CatchUpPage> {
  const memberships = await db
    .select({
      tribeId: tribeMember.tribeId,
      joinedAt: tribeMember.joinedAt,
      lastCatchUpAt: tribeMemberPreference.lastCatchUpAt,
      name: tribe.name,
      avatar: media.fileUrl,
      color: tribe.color,
    })
    .from(tribeMember)
    .innerJoin(tribe, eq(tribeMember.tribeId, tribe.id))
    .leftJoin(media, eq(tribe.avatar, media.id))
    .leftJoin(tribeMemberPreference, eq(tribeMemberPreference.tribeMemberId, tribeMember.id))
    .where(
      params.tribeId
        ? and(eq(tribeMember.userId, userId), eq(tribeMember.tribeId, params.tribeId))
        : eq(tribeMember.userId, userId)
    );
  if (memberships.length === 0) return { items: [], tribes: [], nextCursor: null };

  const fallback = new Date(Date.now() - CATCH_UP_FALLBACK_DAYS * 24 * 60 * 60 * 1000);
  const tribeRefs = new Map<string, TribeRef>();
  const sinceByTribe = new Map<string, Date>();
  for (const m of memberships) {
    tribeRefs.set(m.tribeId, { id: m.tribeId, name: m.name, avatar: m.avatar || null, color: m.color ?? null });
    const base = params.since ?? m.lastCatchUpAt ?? fallback;
    sinceByTribe.set(m.tribeId, base > m.joinedAt ? base : m.joinedAt);
  }
  const tribeIds = [...tribeRefs.keys()];
  // "In one of my tribes and newer than that tribe's since" — one OR branch per membership
  const sinceCondition = (tribeColumn: AnyColumn, at: AnyColumn) =>
    or(...tribeIds.map((id) => and(eq(tribeColumn, id), gt(at, sinceByTribe.get(id)!))));

  const closesBefore = new Date(Date.now() + CLOSES_SOON_HOURS * 60 * 60 * 1000);
  const likeCounts = db
    .select({ postId: postLike.postId, likeCount: sql<number>`count(*)::int`.as("like_count") })
    .from(postLike)
    .groupBy(postLike.postId)
    .as("like_counts");
  // Newest RSVP per event, with how many arrived since — the row's actor is who RSVPed last
  const recentRsvps = db
    .select({
      eventId: eventAttendee.eventId,
      userId: eventAttendee.userId,
      createdAt: eventAttendee.createdAt,
      rsvpCount: sql<number>`count(*) over (partition by ${eventAttendee.eventId})::int`.as("rsvp_count"),
      rank: sql<number>`row_number() over (partition by ${eventAttendee.eventId} order by ${eventAttendee.createdAt} desc)`.as("rank"),
    })
    .from(eventAttendee)
    .innerJoin(event, eq(eventAttendee.eventId, event.id))
    .where(
      and(
        ne(eventAttendee.userId, userId),
        excludeBlocked(userId, eventAttendee.userId),
        ne(event.status, "cancelled"),
        sinceCondition(event.tribeId, eventAttendee.createdAt)
      )
    )
    .as("recent_rsvps");

  const [me, recentPosts, closingPolls, rsvpRows, joinedRows, unread] = await Promise.all([
    db.select({ username: user.username }).from(user).where(eq(user.id, userId)).limit(1),
    db
      .select({
        id: post.id,
        tribeId: post.tribeId,
        createdAt: post.createdAt,
        isPinned: post.isPinned,
        likeCount: sql<number>`coalesce(${likeCounts.likeCount}, 0)::int`,
      })
      .from(post)
      .leftJoin(likeCounts, eq(likeCounts.postId, post.id))
      .where(and(ne(post.authorId, userId), excludeBlocked(userId, post.authorId), sinceCondition(post.tribeId, post.createdAt)))
      .orderBy(desc(post.createdAt))
      .limit(SOURCE_CAP),
    db
      .select({
        id: poll.id,
        eventId: poll.eventId,
        postId: poll.postId,
        createdAt: poll.createdAt,
        tribeId: sql<string>`coalesce(${event.tribeId}, ${post.tribeId})`,
        eventStatus: effectiveEventStatus,
      })
      .from(poll)
      .leftJoin(event, eq(poll.eventId, event.id))
      .leftJoin(post, eq(poll.postId, post.id))
      .where(
        and(
          gt(poll.endsAt, sql`now()`),
          lte(poll.endsAt, closesBefore),
          or(inArray(event.tribeId, tribeIds), inArray(post.tribeId, tribeIds))
        )
      )
      .orderBy(asc(poll.endsAt))
      .limit(SOURCE_CAP),
    db
      .select({
        eventId: recentRsvps.eventId,
        createdAt: recentRsvps.createdAt,
        rsvpCount: recentRsvps.rsvpCount,
        actor: userPreviewColumns,
      })
      .from(recentRsvps)
      .innerJoin(user, eq(recentRsvps.userId, user.id))
      .where(eq(recentRsvps.rank, 1))
      .orderBy(desc(recentRsvps.createdAt))
      .limit(SOURCE_CAP),
    db
      .select({
        id: tribeMember.id,
        tribeId: tribeMember.tribeId,
        joinedAt: tribeMember.joinedAt,
        actor: userPreviewColumns,
      })
      .from(tribeMember)
      .innerJoin(user, eq(tribeMember.userId, user.id))
      .where(
        and(
          ne(tribeMember.userId, userId),
          excludeBlocked(userId, tribeMember.userId),
          sinceCondition(tribeMember.tribeId, tribeMember.joinedAt)
        )
      )
      .orderBy(desc(tribeMember.joinedAt))
      .limit(SOURCE_CAP),
    getUnreadPostCounts(userId),
  ]);

  // Polls whose parent is an event keep the event card; post polls ride on their post
  const eventPollIds = new Set(closingPolls.filter((p) => p.eventId && p.eventStatus !== "cancelled").map((p) => p.eventId!));
  const postPollIds = new Set(closingPolls.filter((p) => p.postId).map((p) => p.postId!));
  const postIds = [...new Set([...recentPosts.map((p) => p.id), ...postPollIds])];
  const eventIds = [...new Set([...eventPollIds, ...rsvpRows.map((r) => r.eventId)])];

  const [posts, events] = await Promise.all([getPostsByIds(postIds, userId), getAgendaItems(eventIds, userId)]);
  const postMap = new Map(posts.map((p) => [p.id, p]));

  const mentionTag = me[0]?.username ? `@${me[0].username}` : null;
  const items: (CatchUpItem & { tier: number; likeCount: number })[] = [];

  const postMeta = new Map(recentPosts.map((p) => [p.id, p]));
  for (const id of postIds) {
    const p = postMap.get(id);
    const tribeRef = p && tribeRefs.get(p.tribeId);
    if (!p || !tribeRef) continue;
    const reasons: CatchUpReason[] = [];
    if (p.isPinned) reasons.push("pinned");
    if (mentionTag && p.content.includes(mentionTag)) reasons.push("mention");
    if (postPollIds.has(id)) reasons.push("closes_soon");
    if (p.likeCount >= POPULAR_LIKES) reasons.push("popular");
    items.push({
      id: `post:${p.id}`,
      kind: postPollIds.has(id) && !postMeta.has(id) ? "poll" : "post",
      tribe: tribeRef,
      actor: { id: p.author.id, name: p.author.name, image: p.author.image ?? null },
      reasons,
      post: { ...p, tribe: tribeRef },
      event: null,
      createdAt: p.createdAt,
      tier: reasons.length ? Math.min(...reasons.map((r) => TIER[r])) : PLAIN_TIER,
      likeCount: p.likeCount,
    });
  }
  for (const eventId of eventPollIds) {
    const e = events.get(eventId);
    const tribeRef = e && tribeRefs.get(e.tribe.id);
    if (!e || !tribeRef || !e.openPoll) continue;
    items.push({
      id: `poll:${e.openPoll.id}`,
      kind: "poll",
      tribe: tribeRef,
      actor: e.host,
      reasons: ["closes_soon"],
      post: null,
      event: e,
      createdAt: e.openPoll.endsAt ?? e.startDate,
      tier: TIER.closes_soon,
      likeCount: 0,
    });
  }
  for (const r of rsvpRows) {
    const e = events.get(r.eventId);
    const tribeRef = e && tribeRefs.get(e.tribe.id);
    if (!e || !tribeRef) continue;
    items.push({
      id: `event_rsvps:${e.id}`,
      kind: "event_rsvps",
      tribe: tribeRef,
      actor: r.actor,
      reasons: ["new_rsvps"],
      post: null,
      event: e,
      createdAt: r.createdAt,
      tier: TIER.new_rsvps,
      likeCount: r.rsvpCount,
    });
  }
  for (const j of joinedRows) {
    const tribeRef = tribeRefs.get(j.tribeId);
    if (!tribeRef) continue;
    items.push({
      id: `member_joined:${j.id}`,
      kind: "member_joined",
      tribe: tribeRef,
      actor: j.actor,
      reasons: ["joined"],
      post: null,
      event: null,
      createdAt: j.joinedAt,
      tier: TIER.joined,
      likeCount: 0,
    });
  }

  items.sort(
    (a, b) => a.tier - b.tier || b.likeCount - a.likeCount || b.createdAt.getTime() - a.createdAt.getTime()
  );

  const offset = decodeCursor(params.cursor);
  const page = items.slice(offset, offset + params.limit).map(({ tier: _tier, likeCount: _likes, ...item }) => item);
  const nextCursor = offset + params.limit < items.length ? encodeCursor(offset + params.limit) : null;

  return {
    items: page,
    tribes: memberships.map((m) => ({ ...tribeRefs.get(m.tribeId)!, unreadCount: unread.get(m.tribeId) ?? 0 })),
    nextCursor,
  };
}
