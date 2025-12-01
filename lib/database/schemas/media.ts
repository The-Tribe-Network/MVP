import { pgTable, text, timestamp, integer, bigint, uuid, unique, boolean, index } from "drizzle-orm/pg-core";
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
  privacy: albumPrivacy("privacy").default("public").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => ({
  coverIdIdx: index("idx_album_cover_id").on(table.coverId),
}));

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => post.id, { onDelete: "cascade" }),
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
  altText: text("alt_text"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Junction table for many-to-many album-media relationship
export const albumMedia = pgTable("album_media", {
  id: uuid("id").primaryKey().defaultRandom(),
  albumId: uuid("album_id")
    .references(() => album.id, { onDelete: "set null" }), // If albumId is null, the media will be added to the general album
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
  addedAtIdx: index("idx_album_media_added_at").on(table.addedAt),
  albumIdIdx: index("idx_album_media_album_id").on(table.albumId),
  mediaIdIdx: index("idx_album_media_media_id").on(table.mediaId),
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

