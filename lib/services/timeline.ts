import { db, getDbTransaction } from "@/lib/database/client";
import { timeline, timelineMute, timelineRead } from "@/lib/database/schemas/timeline";
import { post } from "@/lib/database/schemas/post";
import { chatMessage, chatMessageMedia } from "@/lib/database/schemas/chat";
import { media } from "@/lib/database/schemas/media";
import { notification } from "@/lib/database/schemas/activity";
import { tribeMemberPreference } from "@/lib/database/schemas/tribe";
import { and, asc, count, eq, gt, inArray, isNull, max, ne, sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { getMemberWithPermissions, type MemberWithPermissions } from "./permissions";
import { resolveEffectivePermissions } from "./member-permissions";
import { excludeBlocked } from "./blocks";

export const GLOBAL_TIMELINE_NAME = "Global";

// The http `db` or a transaction, as for notify()
type Executor = Pick<PgDatabase<PgQueryResultHKT, any, any>, "select" | "insert">;

export type Timeline = typeof timeline.$inferSelect;
export type TimelineType = Timeline["type"];
export type TimelinePostPermission = Timeline["postPermission"];

/** A timeline as the switcher shows it to one member. */
export type TimelineForMember = Timeline & {
  // Posts (posts timelines) or messages (chat) by others since the member last opened it
  unreadCount: number;
  // Whether the member may post (posts) or send (chat) here: the tribe permission and the timeline's rule
  canPost: boolean;
  // The member muted it: no @mention or reply notifications from it (TRI-317)
  isMuted: boolean;
};

/** A timeline route failure the route turns into `{ error, code }` with `status`. */
export class TimelineError extends Error {
  constructor(
    public code: "NOT_A_MEMBER" | "NOT_FOUND" | "FORBIDDEN" | "GLOBAL_TIMELINE" | "INVALID_ORDER",
    message: string,
    public status: 400 | 403 | 404,
  ) {
    super(message);
    this.name = "TimelineError";
  }
}

/** Every tribe gets its Global timeline in the transaction that creates it (TRI-313). */
export async function createGlobalTimeline(tx: Executor, tribeId: string, createdBy: string) {
  const [created] = await tx
    .insert(timeline)
    .values({ tribeId, name: GLOBAL_TIMELINE_NAME, type: "posts", isGlobal: true, position: 0, createdBy })
    .returning();
  return created;
}

/** The tribe's Global timeline id: where posts go when no timeline is given. */
export async function getGlobalTimelineId(tribeId: string, executor: Executor = db): Promise<string> {
  const [row] = await executor
    .select({ id: timeline.id })
    .from(timeline)
    .where(and(eq(timeline.tribeId, tribeId), eq(timeline.isGlobal, true)))
    .limit(1);
  if (!row) {
    throw new Error(`Tribe ${tribeId} has no Global timeline`);
  }
  return row.id;
}

/** A timeline of this tribe, or null (unknown id, or another tribe's). */
export async function getTimelineInTribe(tribeId: string, timelineId: string): Promise<Timeline | null> {
  const [row] = await db
    .select()
    .from(timeline)
    .where(and(eq(timeline.id, timelineId), eq(timeline.tribeId, tribeId)))
    .limit(1);
  return row ?? null;
}

/** Whether a role passes a timeline's "who can post": `admins` means the owner and admins. */
export function roleMeetsTimelinePermission(role: string, postPermission: TimelinePostPermission): boolean {
  return postPermission === "everyone" || role === "owner" || role === "admin";
}

async function memberOrThrow(tribeId: string, userId: string): Promise<MemberWithPermissions> {
  const memberData = await getMemberWithPermissions(tribeId, userId);
  if (!memberData) {
    throw new TimelineError("NOT_A_MEMBER", "You must be a member of this tribe", 403);
  }
  return memberData;
}

async function permissionsOf(tribeId: string, memberData: MemberWithPermissions) {
  const { effectivePermissions } = await resolveEffectivePermissions(tribeId, memberData);
  return effectivePermissions;
}

/**
 * Who may rename, re-rule or delete a timeline: whoever may edit tribe settings (TSET-06), and the timeline's
 * creator while they still have `canCreateTimelines`.
 */
function canManage(permissions: Record<string, boolean>, userId: string, target: Timeline): boolean {
  if (permissions.canEditTribeSettings) return true;
  return target.createdBy === userId && permissions.canCreateTimelines === true;
}

/**
 * The tribe's timelines in switcher order with the member's unread counts and posting rights, and the
 * member's selected timeline (Global when they never picked one, or the pick was deleted).
 */
export async function listTimelines(
  tribeId: string,
  userId: string,
): Promise<{ timelines: TimelineForMember[]; selectedTimelineId: string }> {
  const memberData = await memberOrThrow(tribeId, userId);
  const role = memberData.member.role;

  // Unread = posts or messages by others since the member last opened the timeline, or since they joined
  const since = (timelineColumn: typeof post.timelineId | typeof chatMessage.timelineId) =>
    sql`coalesce((select ${timelineRead.lastReadAt} from ${timelineRead}
      where ${timelineRead.timelineId} = ${timelineColumn} and ${timelineRead.userId} = ${userId}::uuid), ${memberData.member.joinedAt})`;
  const postUnread = [eq(post.tribeId, tribeId), ne(post.authorId, userId), gt(post.createdAt, since(post.timelineId))];
  const notBlocked = excludeBlocked(userId, post.authorId);
  if (notBlocked) postUnread.push(notBlocked);
  const chatUnread = [
    eq(chatMessage.tribeId, tribeId),
    ne(chatMessage.authorId, userId),
    isNull(chatMessage.deletedAt),
    gt(chatMessage.createdAt, since(chatMessage.timelineId)),
  ];
  const chatNotBlocked = excludeBlocked(userId, chatMessage.authorId);
  if (chatNotBlocked) chatUnread.push(chatNotBlocked);

  const [rows, permissions, [preference], unread, chatUnreadRows, mutes] = await Promise.all([
    db
      .select()
      .from(timeline)
      .where(eq(timeline.tribeId, tribeId))
      .orderBy(asc(timeline.position), asc(timeline.createdAt)),
    permissionsOf(tribeId, memberData),
    db
      .select({ selectedTimelineId: tribeMemberPreference.selectedTimelineId })
      .from(tribeMemberPreference)
      .where(eq(tribeMemberPreference.tribeMemberId, memberData.member.id))
      .limit(1),
    db
      .select({ timelineId: post.timelineId, count: count() })
      .from(post)
      .where(and(...postUnread))
      .groupBy(post.timelineId),
    db
      .select({ timelineId: chatMessage.timelineId, count: count() })
      .from(chatMessage)
      .where(and(...chatUnread))
      .groupBy(chatMessage.timelineId),
    db
      .select({ timelineId: timelineMute.timelineId })
      .from(timelineMute)
      .innerJoin(timeline, eq(timelineMute.timelineId, timeline.id))
      .where(and(eq(timeline.tribeId, tribeId), eq(timelineMute.userId, userId))),
  ]);
  const mutedIds = new Set(mutes.map((m) => m.timelineId));
  const unreadMap = new Map([...unread, ...chatUnreadRows].map((u) => [u.timelineId, Number(u.count)]));

  const timelines = rows.map((row) => ({
    ...row,
    unreadCount: unreadMap.get(row.id) ?? 0,
    isMuted: mutedIds.has(row.id),
    canPost:
      (row.type === "chat" ? permissions.canSendMessages : permissions.canPost) === true &&
      roleMeetsTimelinePermission(role, row.postPermission),
  }));

  const global = rows.find((row) => row.isGlobal);
  if (!global) {
    throw new Error(`Tribe ${tribeId} has no Global timeline`);
  }
  const selected = preference?.selectedTimelineId;
  const selectedTimelineId = selected && rows.some((row) => row.id === selected) ? selected : global.id;

  return { timelines, selectedTimelineId };
}

/** Create a posts or chat timeline at the end of the switcher. Needs `canCreateTimelines`. */
export async function createTimeline(
  tribeId: string,
  userId: string,
  input: { name: string; type: TimelineType; emoji?: string | null; postPermission?: TimelinePostPermission },
): Promise<Timeline> {
  const memberData = await memberOrThrow(tribeId, userId);
  const permissions = await permissionsOf(tribeId, memberData);
  if (!permissions.canCreateTimelines) {
    throw new TimelineError("FORBIDDEN", "You do not have permission to create timelines in this tribe", 403);
  }

  const [{ last }] = await db
    .select({ last: max(timeline.position) })
    .from(timeline)
    .where(eq(timeline.tribeId, tribeId));

  const [created] = await db
    .insert(timeline)
    .values({
      tribeId,
      name: input.name,
      type: input.type,
      emoji: input.emoji ?? null,
      postPermission: input.postPermission ?? "everyone",
      position: (last ?? 0) + 1,
      createdBy: userId,
    })
    .returning();
  return created;
}

/** Rename, change the emoji or who can post. Global can be renamed; a timeline's type never changes. */
export async function updateTimeline(
  tribeId: string,
  timelineId: string,
  userId: string,
  patch: { name?: string; emoji?: string | null; postPermission?: TimelinePostPermission },
): Promise<Timeline> {
  const memberData = await memberOrThrow(tribeId, userId);
  const target = await getTimelineInTribe(tribeId, timelineId);
  if (!target) {
    throw new TimelineError("NOT_FOUND", "Timeline not found", 404);
  }
  const permissions = await permissionsOf(tribeId, memberData);
  if (!canManage(permissions, userId, target)) {
    throw new TimelineError("FORBIDDEN", "You do not have permission to edit this timeline", 403);
  }

  const [updated] = await db
    .update(timeline)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(timeline.id, timelineId))
    .returning();
  return updated;
}

/**
 * Delete a timeline and everything in it (owner, 2026-09-25): its posts and chat messages go with it, with their
 * comments, likes, reactions and photos, so nothing meant for one timeline surfaces anywhere else.
 * Members who had it selected fall back to Global. Global can't be deleted.
 */
export async function deleteTimeline(tribeId: string, timelineId: string, userId: string): Promise<void> {
  const memberData = await memberOrThrow(tribeId, userId);
  const target = await getTimelineInTribe(tribeId, timelineId);
  if (!target) {
    throw new TimelineError("NOT_FOUND", "Timeline not found", 404);
  }
  if (target.isGlobal) {
    throw new TimelineError("GLOBAL_TIMELINE", "The Global timeline can't be deleted", 400);
  }
  const permissions = await permissionsOf(tribeId, memberData);
  if (!canManage(permissions, userId, target)) {
    throw new TimelineError("FORBIDDEN", "You do not have permission to delete this timeline", 403);
  }

  // Chat photos first (they hang off media, not the timeline); then post.timeline_id, chat_message and
  // timeline_read cascade, and tribe_member_preference.selected_timeline_id is set null
  await getDbTransaction().transaction(async (tx) => {
    await tx.delete(media).where(
      inArray(
        media.id,
        tx
          .select({ id: chatMessageMedia.mediaId })
          .from(chatMessageMedia)
          .innerJoin(chatMessage, eq(chatMessageMedia.messageId, chatMessage.id))
          .where(eq(chatMessage.timelineId, timelineId)),
      ),
    );
    // Its chat @mention / reply rows quote its messages (TRI-317)
    await tx
      .delete(notification)
      .where(and(eq(notification.entityType, "timeline"), eq(notification.entityId, timelineId)));
    await tx.delete(timeline).where(eq(timeline.id, timelineId));
  });
}

/** Put the tribe's timelines in this order. The list must hold every timeline of the tribe exactly once. */
export async function reorderTimelines(tribeId: string, userId: string, timelineIds: string[]): Promise<Timeline[]> {
  const memberData = await memberOrThrow(tribeId, userId);
  const permissions = await permissionsOf(tribeId, memberData);
  if (!permissions.canEditTribeSettings) {
    throw new TimelineError("FORBIDDEN", "You do not have permission to reorder timelines", 403);
  }

  const existing = await db.select({ id: timeline.id }).from(timeline).where(eq(timeline.tribeId, tribeId));
  const ids = new Set(existing.map((row) => row.id));
  const exact =
    new Set(timelineIds).size === timelineIds.length &&
    timelineIds.length === ids.size &&
    timelineIds.every((id) => ids.has(id));
  if (!exact) {
    throw new TimelineError("INVALID_ORDER", "timelineIds must list every timeline of this tribe exactly once", 400);
  }

  await getDbTransaction().transaction(async (tx) => {
    for (const [position, id] of timelineIds.entries()) {
      await tx.update(timeline).set({ position, updatedAt: new Date() }).where(eq(timeline.id, id));
    }
  });

  return db.select().from(timeline).where(inArray(timeline.id, timelineIds)).orderBy(asc(timeline.position));
}

/** Remember the member's pick on the Timeline tab (R13.4); null means Global. Returns the resolved id. */
export async function selectTimeline(tribeId: string, userId: string, timelineId: string | null): Promise<string> {
  const memberData = await memberOrThrow(tribeId, userId);
  if (timelineId && !(await getTimelineInTribe(tribeId, timelineId))) {
    throw new TimelineError("NOT_FOUND", "Timeline not found", 404);
  }

  await db
    .insert(tribeMemberPreference)
    .values({ tribeMemberId: memberData.member.id, userId, selectedTimelineId: timelineId })
    .onConflictDoUpdate({
      target: tribeMemberPreference.tribeMemberId,
      set: { selectedTimelineId: timelineId, updatedAt: new Date() },
    });

  return timelineId ?? (await getGlobalTimelineId(tribeId));
}

/** Mute or unmute a timeline for the member (TRI-317). Idempotent; returns the new state. */
export async function setTimelineMuted(tribeId: string, timelineId: string, userId: string, muted: boolean): Promise<boolean> {
  await memberOrThrow(tribeId, userId);
  if (!(await getTimelineInTribe(tribeId, timelineId))) {
    throw new TimelineError("NOT_FOUND", "Timeline not found", 404);
  }
  if (muted) {
    await db.insert(timelineMute).values({ timelineId, userId }).onConflictDoNothing();
  } else {
    await db.delete(timelineMute).where(and(eq(timelineMute.timelineId, timelineId), eq(timelineMute.userId, userId)));
  }
  return muted;
}

/** The member opened the timeline: its unread count starts again from now. */
export async function markTimelineRead(tribeId: string, timelineId: string, userId: string): Promise<Date> {
  await memberOrThrow(tribeId, userId);
  if (!(await getTimelineInTribe(tribeId, timelineId))) {
    throw new TimelineError("NOT_FOUND", "Timeline not found", 404);
  }

  const lastReadAt = new Date();
  await db
    .insert(timelineRead)
    .values({ timelineId, userId, lastReadAt })
    .onConflictDoUpdate({
      target: [timelineRead.timelineId, timelineRead.userId],
      set: { lastReadAt, updatedAt: lastReadAt },
    });
  return lastReadAt;
}

/**
 * The posts timeline a new post goes to, checked for the author's role: `timelineId`, or Global when none is
 * given. A chat timeline takes messages, not posts; an admins-only timeline takes posts from the owner and
 * admins only.
 */
export async function resolvePostTimeline(
  tribeId: string,
  timelineId: string | null | undefined,
  role: string,
): Promise<{ ok: true; timelineId: string } | { ok: false; reason: "INVALID_TIMELINE" | "FORBIDDEN" }> {
  if (!timelineId) {
    return { ok: true, timelineId: await getGlobalTimelineId(tribeId) };
  }
  const target = await getTimelineInTribe(tribeId, timelineId);
  if (!target || target.type !== "posts") {
    return { ok: false, reason: "INVALID_TIMELINE" };
  }
  if (!roleMeetsTimelinePermission(role, target.postPermission)) {
    return { ok: false, reason: "FORBIDDEN" };
  }
  return { ok: true, timelineId: target.id };
}
