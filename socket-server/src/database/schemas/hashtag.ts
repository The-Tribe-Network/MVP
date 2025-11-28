import { pgTable, text, timestamp, integer, unique, uuid } from "drizzle-orm/pg-core";
import { post } from "./post";

export const hashtag = pgTable("hashtag", {
  id: uuid("id").primaryKey().defaultRandom(),
  tag: text("tag").notNull().unique(),
  postCount: integer("post_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const postHashtag = pgTable("post_hashtag", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id")
    .notNull()
    .references(() => post.id, { onDelete: "cascade" }),
  hashtagId: uuid("hashtag_id")
    .notNull()
    .references(() => hashtag.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniquePostHashtag: unique().on(table.postId, table.hashtagId),
}));

