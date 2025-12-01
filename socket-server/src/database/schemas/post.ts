import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { tribe } from "./tribe";
import { user } from "./auth";

export const post = pgTable("post", {
  id: uuid("id").primaryKey().defaultRandom(),
  tribeId: uuid("tribe_id")
    .notNull()
    .references(() => tribe.id, { onDelete: "cascade" }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const postLike = pgTable("post_like", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id")
    .notNull()
    .references(() => post.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniquePostUser: unique().on(table.postId, table.userId),
}));

export const comment = pgTable("comment", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id")
    .notNull()
    .references(() => post.id, { onDelete: "cascade" }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  parentCommentId: uuid("parent_comment_id").references((): any => comment.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const commentLike = pgTable("comment_like", {
  id: uuid("id").primaryKey().defaultRandom(),
  commentId: uuid("comment_id")
    .notNull()
    .references(() => comment.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueCommentUser: unique().on(table.commentId, table.userId),
}));

