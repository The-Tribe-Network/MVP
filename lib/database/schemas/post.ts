import { pgTable, text, timestamp, unique, uuid, index, boolean, integer } from "drizzle-orm/pg-core";
import { tribe } from "./tribe";
import { user } from "./auth";
import { album, media } from "./media";
import { event } from "./event";
import { poll } from "./poll";
import { postKind } from "./enums";

export const post = pgTable("post", {
  id: uuid("id").primaryKey().defaultRandom(),
  tribeId: uuid("tribe_id")
    .notNull()
    .references(() => tribe.id, { onDelete: "cascade" }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  linkedAlbumId: uuid("linked_album_id")
    .references(() => album.id, { onDelete: "set null" }),
  eventId: uuid("event_id")
    .references(() => event.id, { onDelete: "set null" }),
  pollId: uuid("poll_id")
    .references((): any => poll.id, { onDelete: "set null" }),
  kind: postKind("kind").notNull().default("text"),
  isPinned: boolean("is_pinned").notNull().default(false),
  pinnedAt: timestamp("pinned_at"),
  pinnedBy: uuid("pinned_by")
    .references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => ({
  linkedAlbumIdIdx: index("idx_post_linked_album_id").on(table.linkedAlbumId),
  tribePinnedCreatedIdx: index("idx_post_tribe_pinned_created").on(
    table.tribeId,
    table.isPinned.desc(),
    table.createdAt.desc(),
  ),
}));

// Ordered post <-> media join for multi-photo posts. media.postId stays in sync for the web app.
export const postMedia = pgTable("post_media", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id")
    .notNull()
    .references(() => post.id, { onDelete: "cascade" }),
  mediaId: uuid("media_id")
    .notNull()
    .references(() => media.id, { onDelete: "cascade" }),
  displayOrder: integer("display_order").notNull().default(0),
}, (table) => ({
  uniquePostMedia: unique().on(table.postId, table.mediaId),
  postIdIdx: index("idx_post_media_post_id").on(table.postId),
}));

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
    .references(() => post.id, { onDelete: "cascade" }),
  eventId: uuid("event_id")
    .references(() => event.id, { onDelete: "cascade" }),
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
}, (table) => ({
  // Media.commentCount per listed media (TRI-207). tri207-media-list-indexes.sql
  postIdIdx: index("idx_comment_post_id").on(table.postId),
}));

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

