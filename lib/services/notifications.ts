import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

import { notification } from "@/lib/database/schemas/activity";
import { event, eventAttendee, eventCoHost } from "@/lib/database/schemas/event";
import { tribeMember } from "@/lib/database/schemas/tribe";

/**
 * The one way to emit a notification (TRI-183, ADR-17): a transactional outbox, not a broker.
 *
 * Call `notify(tx, event)` inside the transaction of the write that caused it, so the write and its
 * notifications commit or roll back together. A caller whose only write is the notification may pass `db`.
 * No transport here. Preferences have two levels (owner, 2026-09-24): a category turned off in general means no
 * row, and that filter belongs here once TRI-8 stores it; push toggles, quiet hours and tribe mutes are applied
 * later by the push worker (TRI-12) and keep the row. Until TRI-8, every recipient gets a row.
 */

/** `db` or a transaction (`getDbTransaction().transaction(tx => …)`); both are PgDatabases. */
export type NotifyExecutor = Pick<PgDatabase<PgQueryResultHKT, any, any>, "select" | "insert">;

/** What each type may point at. The mobile contract's `Notification.type` plus server-only types. */
const ENTITY_TYPES = {
  like: ["post", "comment", "media"],
  comment: ["post", "event"],
  reply: ["comment"],
  mention: ["post", "comment"],
  event_reminder: ["event"],
  event_update: ["event"],
  event_cohost_request: ["event"],
  rsvp: ["event"],
  invite: ["invitation"],
  media_added: ["album"],
  announcement: ["post", "event"],
  member_joined: ["tribe"],
} as const;

export type NotificationType = keyof typeof ENTITY_TYPES;

export type NotificationEvent = {
  [T in NotificationType]: {
    type: T;
    /** Who did it; excluded from `recipients`. Null for system events (reminders, poll close). */
    actorId: string | null;
    /** Null for account-level notifications (no tribe). */
    tribeId: string | null;
    entityType: (typeof ENTITY_TYPES)[T][number];
    entityId: string;
    recipients: readonly string[];
    title: string;
    message: string;
    /** In-app path the row opens, e.g. `/tribes/<id>/events/<id>`. */
    link: string | null;
    /**
     * Collapse into the recipient's unread row for the same (type, entity): five likes on one post are one
     * row whose `actorCount` grows and whose actor/title/message/link become the latest. `true` keys on
     * type + entity; a string keys more narrowly (e.g. per requester).
     */
    collapse?: boolean | string;
  };
}[NotificationType];

export function dedupeKeyFor(event: Pick<NotificationEvent, "type" | "entityType" | "entityId" | "collapse">) {
  if (!event.collapse) return null;
  const base = `${event.type}:${event.entityType}:${event.entityId}`;
  return event.collapse === true ? base : `${base}:${event.collapse}`;
}

/** Inserts (or collapses into) one row per recipient, minus the actor. Returns how many recipients it wrote for. */
export async function notify(executor: NotifyExecutor, event: NotificationEvent): Promise<number> {
  const recipients = [...new Set(event.recipients)].filter((id) => id !== event.actorId);
  if (recipients.length === 0) return 0;

  const dedupeKey = dedupeKeyFor(event);
  const rows = recipients.map((userId) => ({
    userId,
    type: event.type,
    title: event.title,
    message: event.message,
    link: event.link,
    actorId: event.actorId,
    tribeId: event.tribeId,
    entityType: event.entityType,
    entityId: event.entityId,
    dedupeKey,
  }));

  if (!dedupeKey) {
    await executor.insert(notification).values(rows);
    return recipients.length;
  }

  await executor
    .insert(notification)
    .values(rows)
    .onConflictDoUpdate({
      target: [notification.userId, notification.dedupeKey],
      targetWhere: sql`${notification.readAt} IS NULL AND ${notification.dedupeKey} IS NOT NULL`,
      set: {
        title: sql`excluded.title`,
        message: sql`excluded.message`,
        link: sql`excluded.link`,
        actorId: sql`excluded.actor_id`,
        // Approximate: counts events from a different actor than the last one, not distinct actors
        actorCount: sql`${notification.actorCount} + CASE WHEN ${notification.actorId} IS DISTINCT FROM excluded.actor_id THEN 1 ELSE 0 END`,
        latestAt: sql`now()`,
      },
    });
  return recipients.length;
}

/** The recipient's unread row for a collapse key, if any (e.g. "a co-host request is already pending"). */
export async function findUnreadNotification(
  executor: NotifyExecutor,
  userId: string,
  event: Pick<NotificationEvent, "type" | "entityType" | "entityId" | "collapse">
) {
  const dedupeKey = dedupeKeyFor(event);
  if (!dedupeKey) return null;
  const [row] = await executor
    .select({ id: notification.id })
    .from(notification)
    .where(and(eq(notification.userId, userId), eq(notification.dedupeKey, dedupeKey), isNull(notification.readAt)))
    .limit(1);
  return row ?? null;
}

// ── recipient resolution (the actor is dropped by notify(), not here) ──

export async function tribeMemberIds(executor: NotifyExecutor, tribeId: string): Promise<string[]> {
  const rows = await executor
    .select({ userId: tribeMember.userId })
    .from(tribeMember)
    .where(eq(tribeMember.tribeId, tribeId));
  return rows.map((row) => row.userId);
}

/** The event's creator and co-hosts. */
export async function eventHostIds(executor: NotifyExecutor, eventId: string): Promise<string[]> {
  // Sequential: a transaction is one connection
  const creator = await executor.select({ userId: event.createdBy }).from(event).where(eq(event.id, eventId));
  const coHosts = await executor
    .select({ userId: eventCoHost.userId })
    .from(eventCoHost)
    .where(eq(eventCoHost.eventId, eventId));
  return [...creator, ...coHosts].map((row) => row.userId);
}

/** Attendees whose RSVP is one of `statuses` (going + maybe by default). */
export async function eventAttendeeIds(
  executor: NotifyExecutor,
  eventId: string,
  statuses: ("going" | "maybe" | "not_going")[] = ["going", "maybe"]
): Promise<string[]> {
  const rows = await executor
    .select({ userId: eventAttendee.userId })
    .from(eventAttendee)
    .where(and(eq(eventAttendee.eventId, eventId), inArray(eventAttendee.status, statuses)));
  return rows.map((row) => row.userId);
}
