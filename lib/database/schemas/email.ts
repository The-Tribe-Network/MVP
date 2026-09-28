import { sql } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { user } from "@/lib/database/schemas/auth";
import { tribe } from "@/lib/database/schemas/tribe";

/**
 * A user's email opt-outs (TRI-344). No row = every category on. Written by the one-click unsubscribe link
 * (`/api/email/unsubscribe`); there's no app setting for it in the alpha. When notification preferences land
 * (TRI-8, `email: { enabled, dailyDigest }`), these two map onto them.
 *
 * Kept out of Better-Auth's `user` table so an auth read never depends on this migration.
 */
export const userEmailPreference = pgTable("user_email_preference", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  // Event cancelled / time changed (TRI-349) and the day-before reminder (TRI-350)
  eventUpdates: boolean("event_updates").default(true).notNull(),
  // The daily digest of unread notifications (TRI-347)
  digest: boolean("digest").default(true).notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * Outbox for the "event cancelled / moved" email (TRI-349). Written in the transaction of the event edit, sent after
 * it commits: a cancellation at once, a time or place change after a 10-minute window in which further edits fold
 * into the same row (one pending row per event). The cron route sends whatever is due.
 *
 * `before_*` is the event as it was before the first edit of the window; `after_*` the latest. Everything the email
 * needs is copied here, because a cancelled event may be deleted before the row is sent (no FK on `event_id`).
 */
export const eventChangeEmail = pgTable(
  "event_change_email",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id").notNull(),
    tribeId: uuid("tribe_id")
      .notNull()
      .references(() => tribe.id, { onDelete: "cascade" }),
    // "cancelled" or "changed" (time and/or place); a cancellation replaces a pending change
    kind: text("kind").$type<"cancelled" | "changed">().notNull(),
    // Whether the event still exists (a delete of an upcoming event sends "cancelled" with deleted = true)
    deleted: boolean("deleted").default(false).notNull(),
    actorId: uuid("actor_id").references(() => user.id, { onDelete: "set null" }),
    // Going + maybe + hosts at the time of the edit; skip rules are applied when sending
    recipientIds: uuid("recipient_ids").array().notNull(),
    title: text("title").notNull(),
    beforeStart: timestamp("before_start").notNull(),
    beforeEnd: timestamp("before_end"),
    beforeLocation: text("before_location"),
    afterStart: timestamp("after_start").notNull(),
    afterEnd: timestamp("after_end"),
    afterLocation: text("after_location"),
    sendAfter: timestamp("send_after").notNull(),
    sentAt: timestamp("sent_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    onePendingPerEvent: uniqueIndex("uq_event_change_email_pending")
      .on(table.eventId)
      .where(sql`${table.sentAt} IS NULL`),
    due: index("idx_event_change_email_due").on(table.sendAfter).where(sql`${table.sentAt} IS NULL`),
  })
);
