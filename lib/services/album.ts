import { db } from "@/lib/database/client";
import { album, media, mediaLike } from "@/lib/database/schemas/media";
import { user } from "@/lib/database/schemas/auth";
import { tribe } from "@/lib/database/schemas/tribe";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { canUserCreateAlbums } from "./permissions";

export interface CreateAlbumData {
  tribeId: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  privacy?: "public" | "private" | "admin_only";
}

export interface UpdateAlbumData {
  name?: string;
  description?: string;
  coverImageUrl?: string;
  privacy?: "public" | "private" | "admin_only";
}

/**
 * Create a new album
 * @param userId - The ID of the user creating the album
 * @param albumData - The album data
 * @returns The created album
 */
export async function createAlbum(
  userId: string,
  albumData: CreateAlbumData
) {
  // Check permissions
  const hasPermission = await canUserCreateAlbums(albumData.tribeId, userId);
  if (!hasPermission) {
    throw new Error("User does not have permission to create albums");
  }

  // Create the album
  const newAlbum = await db
    .insert(album)
    .values({
      tribeId: albumData.tribeId,
      createdBy: userId,
      name: albumData.name,
      description: albumData.description,
      coverImageUrl: albumData.coverImageUrl,
      privacy: albumData.privacy || "public",
    })
    .returning();

  return newAlbum[0];
}

/**
 * Get an album by ID with its media
 * @param albumId - The album ID
 * @returns The album with media or null if not found
 */
export async function getAlbumById(albumId: string) {
  const albumRecord = await db
    .select({
      id: album.id,
      tribeId: album.tribeId,
      name: album.name,
      description: album.description,
      coverImageUrl: album.coverImageUrl,
      privacy: album.privacy,
      createdAt: album.createdAt,
      updatedAt: album.updatedAt,
      creator: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      tribe: {
        id: tribe.id,
        name: tribe.name,
      },
    })
    .from(album)
    .leftJoin(user, eq(album.createdBy, user.id))
    .leftJoin(tribe, eq(album.tribeId, tribe.id))
    .where(eq(album.id, albumId))
    .limit(1);

  if (!albumRecord[0]) return null;

  // Get media in this album with like counts
  const albumMedia = await db
    .select({
      id: media.id,
      fileUrl: media.fileUrl,
      fileType: media.fileType,
      fileSize: media.fileSize,
      mimeType: media.mimeType,
      width: media.width,
      height: media.height,
      duration: media.duration,
      thumbnailUrl: media.thumbnailUrl,
      altText: media.altText,
      createdAt: media.createdAt,
      uploadedBy: media.uploadedBy,
      postId: media.postId,
      likeCount: count(mediaLike.id),
    })
    .from(media)
    .leftJoin(mediaLike, eq(media.id, mediaLike.mediaId))
    .where(eq(media.albumId, albumId))
    .groupBy(media.id)
    .orderBy(desc(media.createdAt));

  return {
    ...albumRecord[0],
    media: albumMedia,
    photoCount: albumMedia.length,
  };
}

/**
 * Get all albums for a tribe
 * OPTIMIZED: Uses LEFT JOIN instead of subquery for media count
 * @param tribeId - The tribe ID
 * @param options - Pagination options
 * @returns Array of albums with media counts
 */
export async function getAlbumsByTribe(
  tribeId: string,
  options: { limit?: number; offset?: number } = {}
) {
  const { limit = 50, offset = 0 } = options;

  // Get albums with media counts using LEFT JOIN instead of subquery
  const albums = await db
    .select({
      id: album.id,
      tribeId: album.tribeId,
      name: album.name,
      description: album.description,
      coverImageUrl: album.coverImageUrl,
      privacy: album.privacy,
      createdAt: album.createdAt,
      updatedAt: album.updatedAt,
      creator: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      mediaCount: count(media.id),
    })
    .from(album)
    .leftJoin(user, eq(album.createdBy, user.id))
    .leftJoin(media, eq(media.albumId, album.id))
    .where(eq(album.tribeId, tribeId))
    .groupBy(album.id, user.id)
    .orderBy(desc(album.createdAt))
    .limit(limit)
    .offset(offset);

  return albums;
}

/**
 * Update an album
 * @param albumId - The album ID
 * @param userId - The user ID (must be creator or admin)
 * @param updateData - The data to update
 * @returns The updated album
 */
export async function updateAlbum(
  albumId: string,
  userId: string,
  updateData: UpdateAlbumData
) {
  // Get the album to check ownership
  const albumRecord = await db
    .select()
    .from(album)
    .where(eq(album.id, albumId))
    .limit(1);

  if (!albumRecord[0]) {
    throw new Error("Album not found");
  }

  // Check if user is the creator
  // TODO: Add check for admin/mod permissions
  if (albumRecord[0].createdBy !== userId) {
    throw new Error("User does not have permission to update this album");
  }

  // Update the album
  const updated = await db
    .update(album)
    .set(updateData)
    .where(eq(album.id, albumId))
    .returning();

  return updated[0];
}

/**
 * Delete an album (sets media albumId to null)
 * @param albumId - The album ID
 * @param userId - The user ID (must be creator or admin)
 */
export async function deleteAlbum(albumId: string, userId: string) {
  // Get the album to check ownership
  const albumRecord = await db
    .select()
    .from(album)
    .where(eq(album.id, albumId))
    .limit(1);

  if (!albumRecord[0]) {
    throw new Error("Album not found");
  }

  // Check if user is the creator
  // TODO: Add check for admin/mod permissions
  if (albumRecord[0].createdBy !== userId) {
    throw new Error("User does not have permission to delete this album");
  }

  // Delete the album (media will have albumId set to null due to cascade)
  await db.delete(album).where(eq(album.id, albumId));
}

/**
 * Add media to an album
 * @param mediaId - The media ID
 * @param albumId - The album ID
 * @param userId - The user ID (must be media uploader or admin)
 */
export async function addMediaToAlbum(
  mediaId: string,
  albumId: string,
  userId: string
) {
  // Get the media to check ownership
  const mediaRecord = await db
    .select()
    .from(media)
    .where(eq(media.id, mediaId))
    .limit(1);

  if (!mediaRecord[0]) {
    throw new Error("Media not found");
  }

  // Check if user is the uploader
  // TODO: Add check for admin/mod permissions
  if (mediaRecord[0].uploadedBy !== userId) {
    throw new Error("User does not have permission to modify this media");
  }

  // Update the media's albumId
  const updated = await db
    .update(media)
    .set({ albumId })
    .where(eq(media.id, mediaId))
    .returning();

  return updated[0];
}

/**
 * Remove media from an album
 * @param mediaId - The media ID
 * @param userId - The user ID (must be media uploader or admin)
 */
export async function removeMediaFromAlbum(mediaId: string, userId: string) {
  // Get the media to check ownership
  const mediaRecord = await db
    .select()
    .from(media)
    .where(eq(media.id, mediaId))
    .limit(1);

  if (!mediaRecord[0]) {
    throw new Error("Media not found");
  }

  // Check if user is the uploader
  // TODO: Add check for admin/mod permissions
  if (mediaRecord[0].uploadedBy !== userId) {
    throw new Error("User does not have permission to modify this media");
  }

  // Set albumId to null
  const updated = await db
    .update(media)
    .set({ albumId: null })
    .where(eq(media.id, mediaId))
    .returning();

  return updated[0];
}

/**
 * Get media count for an album
 * @param albumId - The album ID
 * @returns The number of media items in the album
 */
export async function getAlbumMediaCount(albumId: string): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(media)
    .where(eq(media.albumId, albumId));

  return result[0]?.count || 0;
}
