import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { tribe } from "./tribe";
import { post } from "./post";
import { event } from "./event";
import { media } from "./media";
import { activityType } from "./enums";

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

export const notification = pgTable("notification", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

