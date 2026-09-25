import { and, count, desc, eq, inArray, isNull, lte, sql, type SQL } from "drizzle-orm";

import { db } from "@/lib/database/client";
import { user } from "@/lib/database/schemas/auth";
import { notification } from "@/lib/database/schemas/activity";
import { tribe, tribeMember, tribeMemberPreference } from "@/lib/database/schemas/tribe";
import { excludeBlocked } from "./blocks";

/**
 * The read side of notifications (TRI-7; mobile NOTIF-01/03/04): the feed grouped by tribe, the flat feed, mark read,
 * read all. Rows are written by `notify()` (lib/services/notifications.ts).
 *
 * - A group is a tribe the caller belongs to. Rows with no tribe, or from a tribe they haven't joined (invites), are
 *   the `personal` bucket.
 * - A muted tribe (NOTIF-04) still shows its rows but is left out of the total `unreadCount` (the drawer badge).
 * - A row whose actor is in a blocked pair with the caller (TRI-238) is hidden everywhere here: lists, group totals
 *   and every unread count. Rows are kept, so unblocking brings them back. `notify()` writes no new ones.
 */

/** The caller's rows, minus those whose (latest) actor is in a blocked pair with them. */
const ownRows = (userId: string) => and(eq(notification.userId, userId), excludeBlocked(userId, notification.actorId));

export type NotificationFilter = "all" | "mentions" | "events" | "invites";

/** Which types each NOTIF-01 filter chip shows. */
const FILTER_TYPES: Record<Exclude<NotificationFilter, "all">, string[]> = {
  mentions: ["mention", "reply"],
  events: ["event_reminder", "event_update", "rsvp", "new_event", "poll_closed", "event_cohost_request"],
  invites: ["invite"],
};

const typeFilter = (filter: NotificationFilter): SQL | undefined =>
  filter === "all" ? undefined : inArray(notification.type, FILTER_TYPES[filter]);

type Membership = { memberTribeIds: string[]; mutedTribeIds: Set<string> };

async function membershipsOf(userId: string): Promise<Membership> {
  const rows = await db
    .select({ tribeId: tribeMember.tribeId, muted: tribeMemberPreference.notificationsMuted })
    .from(tribeMember)
    .leftJoin(tribeMemberPreference, eq(tribeMemberPreference.tribeMemberId, tribeMember.id))
    .where(eq(tribeMember.userId, userId));
  return {
    memberTribeIds: rows.map((row) => row.tribeId),
    mutedTribeIds: new Set(rows.filter((row) => row.muted).map((row) => row.tribeId)),
  };
}

/** Unread rows outside muted tribes: the drawer badge. */
async function badgeCount(userId: string, mutedTribeIds: Set<string>) {
  const muted = [...mutedTribeIds];
  const [row] = await db
    .select({ n: count() })
    .from(notification)
    .where(
      and(
        ownRows(userId),
        isNull(notification.readAt),
        muted.length
          ? sql`(${notification.tribeId} IS NULL OR ${notification.tribeId} NOT IN (${sql.join(
              muted.map((id) => sql`${id}::uuid`),
              sql`, `
            )}))`
          : undefined
      )
    );
  return Number(row?.n ?? 0);
}

/** The contract's `Notification`, plus `actorCount` and `latestAt` (collapsed rows; TRI-179). */
async function loadNotifications(ids: string[]) {
  if (ids.length === 0) return new Map<string, NotificationDto>();
  const rows = await db
    .select({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link,
      readAt: notification.readAt,
      actorCount: notification.actorCount,
      entityType: notification.entityType,
      entityId: notification.entityId,
      createdAt: notification.createdAt,
      latestAt: notification.latestAt,
      actorId: user.id,
      actorName: user.name,
      actorDisplayName: user.displayName,
      actorImage: user.image,
      tribeId: tribe.id,
      tribeName: tribe.name,
      tribeAvatar: tribe.avatar,
      tribeColor: tribe.color,
    })
    .from(notification)
    .leftJoin(user, eq(user.id, notification.actorId))
    .leftJoin(tribe, eq(tribe.id, notification.tribeId))
    .where(inArray(notification.id, ids));
  return new Map(
    rows.map((row) => [
      row.id,
      {
        id: row.id,
        type: row.type,
        title: row.title,
        message: row.message,
        link: row.link,
        isRead: row.readAt !== null,
        actor: row.actorId ? { id: row.actorId, name: row.actorName!, displayName: row.actorDisplayName, image: row.actorImage } : null,
        actorCount: row.actorCount,
        tribe: row.tribeId
          ? { id: row.tribeId, name: row.tribeName!, avatar: row.tribeAvatar, color: row.tribeColor }
          : null,
        entityType: row.entityType,
        entityId: row.entityId,
        createdAt: row.createdAt,
        latestAt: row.latestAt,
      },
    ])
  );
}

export type NotificationDto = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  actor: { id: string; name: string; displayName: string | null; image: string | null } | null;
  actorCount: number;
  tribe: { id: string; name: string; avatar: string | null; color: string | null } | null;
  entityType: string | null;
  entityId: string | null;
  createdAt: Date;
  latestAt: Date;
};

type Bucket = { items: NotificationDto[]; unreadCount: number; totalCount: number; latestAt: Date | null };

/** GET /me/notifications/groups (NOTIF-01). */
export async function listNotificationGroups(userId: string, filter: NotificationFilter, perGroup: number) {
  const { memberTribeIds, mutedTribeIds } = await membershipsOf(userId);
  const isGroup = (tribeId: string | null): tribeId is string => tribeId !== null && memberTribeIds.includes(tribeId);
  const base = and(ownRows(userId), typeFilter(filter));

  // Newest `perGroup` per tribe (NULL tribes form one partition). Personal is the top of the non-member partitions.
  const ranked = db
    .select({
      id: notification.id,
      tribeId: notification.tribeId,
      latestAt: notification.latestAt,
      rn: sql<number>`row_number() over (partition by ${notification.tribeId} order by ${notification.latestAt} desc, ${notification.id} desc)`.as(
        "rn"
      ),
    })
    .from(notification)
    .where(base)
    .as("ranked");
  const [top, totals, unreadTotal] = await Promise.all([
    db.select({ id: ranked.id, tribeId: ranked.tribeId, latestAt: ranked.latestAt }).from(ranked).where(lte(ranked.rn, perGroup)),
    db
      .select({
        tribeId: notification.tribeId,
        total: count(),
        unread: sql<number>`count(*) filter (where ${notification.readAt} is null)::int`,
        latestAt: sql<Date>`max(${notification.latestAt})`.mapWith(notification.latestAt),
      })
      .from(notification)
      .where(base)
      .groupBy(notification.tribeId),
    badgeCount(userId, mutedTribeIds),
  ]);

  const personalCandidates = top
    .filter((row) => !isGroup(row.tribeId))
    .sort((a, b) => b.latestAt.getTime() - a.latestAt.getTime() || (a.id < b.id ? 1 : -1))
    .slice(0, perGroup);
  const groupTop = top.filter((row) => isGroup(row.tribeId));
  const items = await loadNotifications([...groupTop, ...personalCandidates].map((row) => row.id));

  const buckets = new Map<string, Bucket>();
  const personal: Bucket = { items: [], unreadCount: 0, totalCount: 0, latestAt: null };
  for (const row of totals) {
    const target = isGroup(row.tribeId)
      ? buckets.get(row.tribeId) ?? buckets.set(row.tribeId, { items: [], unreadCount: 0, totalCount: 0, latestAt: null }).get(row.tribeId)!
      : personal;
    target.totalCount += Number(row.total);
    target.unreadCount += Number(row.unread);
    if (!target.latestAt || row.latestAt > target.latestAt) target.latestAt = row.latestAt;
  }
  const byLatest = (a: NotificationDto, b: NotificationDto) => b.latestAt.getTime() - a.latestAt.getTime();
  for (const row of groupTop) buckets.get(row.tribeId!)?.items.push(items.get(row.id)!);
  personal.items = personalCandidates.map((row) => items.get(row.id)!).sort(byLatest);

  const groups = [...buckets.entries()]
    .filter(([, bucket]) => bucket.items.length > 0)
    .map(([tribeId, bucket]) => ({
      tribe: bucket.items[0].tribe!,
      items: bucket.items.sort(byLatest),
      unreadCount: bucket.unreadCount,
      totalCount: bucket.totalCount,
      latestAt: bucket.latestAt!,
      muted: mutedTribeIds.has(tribeId),
    }))
    .sort((a, b) => b.latestAt.getTime() - a.latestAt.getTime());

  return {
    groups,
    personal: { items: personal.items, unreadCount: personal.unreadCount, totalCount: personal.totalCount },
    unreadCount: unreadTotal,
  };
}

const encodeCursor = (latestAt: string, id: string) => Buffer.from(`${latestAt}|${id}`).toString("base64url");

function decodeCursor(cursor: string): { latestAt: string; id: string } | null {
  const [latestAt, id] = Buffer.from(cursor, "base64url").toString().split("|");
  const ok = latestAt && id && /^[0-9a-f-]{36}$/i.test(id) && !Number.isNaN(Date.parse(latestAt.replace(" ", "T")));
  return ok ? { latestAt, id } : null;
}

export class InvalidCursorError extends Error {}

/**
 * GET /me/notifications (NOTIF-03 with `tribeId`): newest first, keyset-paged on (latest_at, id). The cursor carries
 * `latest_at` as Postgres text, so microseconds survive the round trip. With `tribeId`, `unreadCount` is that tribe's
 * (muted or not); without it, the badge count.
 */
export async function listNotifications(
  userId: string,
  opts: { filter: NotificationFilter; tribeId?: string; cursor?: string; limit: number }
) {
  const after = opts.cursor ? decodeCursor(opts.cursor) : null;
  if (opts.cursor && !after) throw new InvalidCursorError("Invalid cursor");

  const page = await db
    .select({ id: notification.id, latestAtText: sql<string>`${notification.latestAt}::text` })
    .from(notification)
    .where(
      and(
        ownRows(userId),
        typeFilter(opts.filter),
        opts.tribeId ? eq(notification.tribeId, opts.tribeId) : undefined,
        after ? sql`(${notification.latestAt}, ${notification.id}) < (${after.latestAt}::timestamp, ${after.id}::uuid)` : undefined
      )
    )
    .orderBy(desc(notification.latestAt), desc(notification.id))
    .limit(opts.limit + 1);

  const more = page.length > opts.limit;
  const rows = page.slice(0, opts.limit);
  const items = await loadNotifications(rows.map((row) => row.id));

  let unreadCount: number;
  if (opts.tribeId) {
    const [row] = await db
      .select({ n: count() })
      .from(notification)
      .where(and(ownRows(userId), eq(notification.tribeId, opts.tribeId), isNull(notification.readAt)));
    unreadCount = Number(row?.n ?? 0);
  } else {
    unreadCount = await badgeCount(userId, (await membershipsOf(userId)).mutedTribeIds);
  }

  const last = rows[rows.length - 1];
  return {
    items: rows.map((row) => items.get(row.id)!),
    unreadCount,
    nextCursor: more && last ? encodeCursor(last.latestAtText, last.id) : null,
  };
}

/** POST /me/notifications/:id/read. False when the row isn't the caller's (the route answers 404). Idempotent. */
export async function markNotificationRead(userId: string, notificationId: string): Promise<boolean> {
  const updated = await db
    .update(notification)
    .set({ readAt: sql`coalesce(${notification.readAt}, now())` })
    .where(and(eq(notification.id, notificationId), eq(notification.userId, userId)))
    .returning({ id: notification.id });
  return updated.length > 0;
}

/** POST /me/notifications/read-all, optionally one tribe's (NOTIF-03 / NOTIF-04). */
export async function markAllNotificationsRead(userId: string, tribeId?: string) {
  await db
    .update(notification)
    .set({ readAt: sql`now()` })
    .where(
      and(
        eq(notification.userId, userId),
        isNull(notification.readAt),
        tribeId ? eq(notification.tribeId, tribeId) : undefined
      )
    );
}

/** NOTIF-04 mute, for the preferences route and TribeSummary. */
export async function mutedTribeIdsOf(userId: string) {
  return (await membershipsOf(userId)).mutedTribeIds;
}
