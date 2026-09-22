import { pgTable, text, timestamp, boolean, uuid, integer, unique, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { event } from "./event";
import { user } from "./auth";
import { post } from "./post";

export const poll = pgTable("poll", {
  id: uuid("id").primaryKey().defaultRandom(),
  // A poll belongs to an event or to a post, never both (poll_owner_check)
  eventId: uuid("event_id")
    .references(() => event.id, { onDelete: "cascade" }),
  postId: uuid("post_id")
    .references((): any => post.id, { onDelete: "cascade" }),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  allowMultiple: boolean("allow_multiple").notNull().default(false),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => ({
  ownerCheck: check("poll_owner_check", sql`(${table.eventId} IS NOT NULL) <> (${table.postId} IS NOT NULL)`),
}));

export const pollOption = pgTable("poll_option", {
  id: uuid("id").primaryKey().defaultRandom(),
  pollId: uuid("poll_id")
    .notNull()
    .references(() => poll.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pollVote = pgTable("poll_vote", {
  id: uuid("id").primaryKey().defaultRandom(),
  pollId: uuid("poll_id")
    .notNull()
    .references(() => poll.id, { onDelete: "cascade" }),
  optionId: uuid("option_id")
    .notNull()
    .references(() => pollOption.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUserOption: unique().on(table.pollId, table.optionId, table.userId),
}));
