import { pgTable, text, timestamp, uuid, boolean, integer, index, uniqueIndex } from "drizzle-orm/pg-core";
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
