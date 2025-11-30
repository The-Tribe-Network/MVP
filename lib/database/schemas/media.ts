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
  coverId: uuid("cover_id").references((): any => media.id, { onDelete: "set null" }),
  coverImageUrl: text("cover_image_url"), // DEPRECATED: Will be removed after migration
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
  albumId: uuid("album_id").references((): any => album.id, { onDelete: "set null" }), // DEPRECATED: Will be removed after migration
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

// Junction table for many-to-many album-media relationship
export const albumMedia = pgTable("album_media", {
  id: uuid("id").primaryKey().defaultRandom(),
  albumId: uuid("album_id")
    .notNull()
    .references(() => album.id, { onDelete: "cascade" }),
  mediaId: uuid("media_id")
    .notNull()
    .references(() => media.id, { onDelete: "cascade" }),
  addedAt: timestamp("added_at").defaultNow().notNull(),
  addedBy: uuid("added_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  displayOrder: integer("display_order"),
}, (table) => ({
  uniqueAlbumMedia: unique().on(table.albumId, table.mediaId),
}));

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

