import { pgTable, text, timestamp, uuid, boolean, integer, index, unique, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { tribe } from "./tribe";
import { user } from "./auth";
import { timelinePostPermission, timelineType } from "./enums";

// A tribe's post feeds and chats (TRI-313, PRD §5.13). Every tribe has exactly one Global timeline, which
// holds every post from before timelines existed and can't be deleted. Private timelines (TRI-325, paid) will
// add a `visibility` column and a member join table; today every timeline is visible to every member.
export const timeline = pgTable("timeline", {
  id: uuid("id").primaryKey().defaultRandom(),
  tribeId: uuid("tribe_id")
    .notNull()
    .references(() => tribe.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  emoji: text("emoji"),
  type: timelineType("type").notNull().default("posts"),
  isGlobal: boolean("is_global").notNull().default(false),
  postPermission: timelinePostPermission("post_permission").notNull().default("everyone"),
  position: integer("position").notNull().default(0),
  createdBy: uuid("created_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => ({
  tribePositionIdx: index("idx_timeline_tribe_position").on(table.tribeId, table.position),
  oneGlobalPerTribe: uniqueIndex("uq_timeline_global_per_tribe").on(table.tribeId).where(sql`${table.isGlobal}`),
}));

// When a member last opened a timeline; drives the switcher's unread counts (TRI-314). Chat's last-read
// message joins it in TRI-315.
export const timelineRead = pgTable("timeline_read", {
  id: uuid("id").primaryKey().defaultRandom(),
  timelineId: uuid("timeline_id")
    .notNull()
    .references(() => timeline.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  lastReadAt: timestamp("last_read_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => ({
  timelineUserUnique: unique("uq_timeline_read_timeline_user").on(table.timelineId, table.userId),
}));

// A member muted this timeline: no @mention or reply notifications from it (TRI-317, owner 2026-09-25)
export const timelineMute = pgTable("timeline_mute", {
  id: uuid("id").primaryKey().defaultRandom(),
  timelineId: uuid("timeline_id")
    .notNull()
    .references(() => timeline.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  timelineUserUnique: unique("uq_timeline_mute_timeline_user").on(table.timelineId, table.userId),
}));
