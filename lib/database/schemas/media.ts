import { pgTable, text, timestamp, integer, bigint, uuid, unique, boolean } from "drizzle-orm/pg-core";
import { tribe } from "./tribe";
import { user } from "./auth";
import { post } from "./post";
import { mediaType, albumPrivacy } from "./enums";

export const album = pgTable("album", {
  id: uuid("id").primaryKey().defaultRandom(),
  tribeId: uuid("tribe_id")
    .notNull()
    .references(() => tribe.id, { onDelete: "cascade" }),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),
  privacy: albumPrivacy("privacy").default("public").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => post.id, { onDelete: "cascade" }),
  albumId: uuid("album_id").references((): any => album.id, { onDelete: "set null" }),
  uploadedBy: uuid("uploaded_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  tribeId: uuid("tribe_id")
    .references(() => tribe.id, { onDelete: "cascade" }),
  fileUrl: text("file_url").notNull(),
  fileType: mediaType("file_type").notNull(),
  fileSize: bigint("file_size", { mode: "number" }),
  mimeType: text("mime_type"),
  width: integer("width"),
  height: integer("height"),
  duration: integer("duration"),
  thumbnailUrl: text("thumbnail_url"),
  addToAlbum: boolean("add_to_album").notNull().default(true),
  altText: text("alt_text"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mediaLike = pgTable("media_like", {
  id: uuid("id").primaryKey().defaultRandom(),
  mediaId: uuid("media_id")
    .notNull()
    .references(() => media.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueMediaUser: unique().on(table.mediaId, table.userId),
}));

