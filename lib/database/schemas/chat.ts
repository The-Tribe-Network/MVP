import { pgTable, text, timestamp, uuid, integer, jsonb, index, unique } from "drizzle-orm/pg-core";
import { tribe } from "./tribe";
import { user } from "./auth";
import { media } from "./media";
import { timeline } from "./timeline";

/** An unfurled link: the first URL in a message, fetched after it is sent (TRI-315). */
export type LinkPreview = {
  url: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  siteName: string | null;
};

/**
 * A message in a chat timeline (TRI-315, PRD §5.13 R13.6). Replaces the never-built `message` / `message_read`
 * tables; direct messages (post-MVP) get their own design. Deleting keeps the row as a "Message deleted"
 * placeholder (`deleted_at`, body cleared, photos and reactions removed) so replies still have a parent.
 * Deleting the timeline deletes its messages.
 */
export const chatMessage = pgTable("chat_message", {
  id: uuid("id").primaryKey().defaultRandom(),
  timelineId: uuid("timeline_id")
    .notNull()
    .references(() => timeline.id, { onDelete: "cascade" }),
  tribeId: uuid("tribe_id")
    .notNull()
    .references(() => tribe.id, { onDelete: "cascade" }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  body: text("body").notNull().default(""),
  replyToId: uuid("reply_to_id").references((): any => chatMessage.id, { onDelete: "set null" }),
  // Mentioned members, next to the plain "@Name" text so a rename never breaks one (TRI-317 notifies them)
  mentionUserIds: uuid("mention_user_ids").array().notNull().default([]),
  linkPreview: jsonb("link_preview").$type<LinkPreview>(),
  editedAt: timestamp("edited_at"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => ({
  // History pages newest first, `id` breaking ties
  timelineCreatedIdx: index("idx_chat_message_timeline_created").on(table.timelineId, table.createdAt.desc(), table.id.desc()),
}));

// A message's photos, in order. The media rows are the tribe's (they also reach Media, R13.9).
export const chatMessageMedia = pgTable("chat_message_media", {
  id: uuid("id").primaryKey().defaultRandom(),
  messageId: uuid("message_id")
    .notNull()
    .references(() => chatMessage.id, { onDelete: "cascade" }),
  mediaId: uuid("media_id")
    .notNull()
    .references(() => media.id, { onDelete: "cascade" }),
  displayOrder: integer("display_order").notNull().default(0),
}, (table) => ({
  // A photo belongs to one message
  mediaUnique: unique("uq_chat_message_media_media").on(table.mediaId),
  messageIdx: index("idx_chat_message_media_message").on(table.messageId),
}));

export const chatMessageReaction = pgTable("chat_message_reaction", {
  id: uuid("id").primaryKey().defaultRandom(),
  messageId: uuid("message_id")
    .notNull()
    .references(() => chatMessage.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  oncePerEmoji: unique("uq_chat_message_reaction").on(table.messageId, table.userId, table.emoji),
}));
