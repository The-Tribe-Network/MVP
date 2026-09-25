import { sql } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp, unique, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { tribe } from "./tribe";
import { post } from "./post";
import { event } from "./event";
import { media } from "./media";
import { activityType, notificationChannel, notificationDeliveryStatus } from "./enums";

export const activity = pgTable("activity", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: activityType("type").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  tribeId: uuid("tribe_id").references(() => tribe.id, { onDelete: "cascade" }),
  postId: uuid("post_id").references(() => post.id, { onDelete: "cascade" }),
  eventId: uuid("event_id").references(() => event.id, { onDelete: "cascade" }),
  mediaId: uuid("media_id").references(() => media.id, { onDelete: "cascade" }),
  targetUserId: uuid("target_user_id").references(() => user.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  preview: text("preview"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// One row per recipient per thing that happened (TRI-179, ADR-17). A category the recipient turned off in general
// gets no row (TRI-8); push toggles, quiet hours and tribe mutes gate `notification_delivery`, never the feed.
// Written only through `notify()` (lib/services/notifications.ts).
export const notification = pgTable(
  "notification",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    link: text("link"),
    // Latest actor; a collapsed row counts the others in `actorCount`
    actorId: uuid("actor_id").references(() => user.id, { onDelete: "set null" }),
    actorCount: integer("actor_count").notNull().default(1),
    // Null for account-level notifications; NOTIF-01 groups by it
    tribeId: uuid("tribe_id").references(() => tribe.id, { onDelete: "cascade" }),
    entityType: text("entity_type"),
    entityId: uuid("entity_id"),
    // Set for collapsible types: a second event with the same key updates the unread row instead of inserting
    dedupeKey: text("dedupe_key"),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    // Last time the row changed (created or collapsed into); the feed orders by it
    latestAt: timestamp("latest_at").defaultNow().notNull(),
  },
  (table) => ({
    userTribeLatestIdx: index("idx_notification_user_tribe_latest").on(
      table.userId,
      table.tribeId,
      table.latestAt.desc()
    ),
    userUnreadIdx: index("idx_notification_user_unread").on(table.userId).where(sql`${table.readAt} IS NULL`),
    unreadDedupeUnique: uniqueIndex("uq_notification_unread_dedupe")
      .on(table.userId, table.dedupeKey)
      .where(sql`${table.readAt} IS NULL AND ${table.dedupeKey} IS NOT NULL`),
  })
);

// Delivery state per channel (TRI-179). The push worker (TRI-12) creates a row when it claims a notification
// for a channel, so a notification without one has not been considered for that channel yet.
export const notificationDelivery = pgTable(
  "notification_delivery",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    notificationId: uuid("notification_id")
      .notNull()
      .references(() => notification.id, { onDelete: "cascade" }),
    channel: notificationChannel("channel").notNull(),
    status: notificationDeliveryStatus("status").notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    sentAt: timestamp("sent_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    notificationChannelUnique: unique("uq_notification_delivery_notification_channel").on(
      table.notificationId,
      table.channel
    ),
    channelStatusIdx: index("idx_notification_delivery_channel_status").on(table.channel, table.status),
  })
);
