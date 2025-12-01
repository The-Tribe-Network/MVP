import { db } from "@/lib/database/client";
import { album, albumMedia, media, mediaLike } from "@/lib/database/schemas/media";
import { user } from "@/lib/database/schemas/auth";
import { tribe } from "@/lib/database/schemas/tribe";
import { eq, and, desc, sql, count, inArray, asc } from "drizzle-orm";
import { canUserCreateAlbums } from "./permissions";
import type { AlbumMedia, AlbumWithMedia } from "@/lib/database/types";

export interface CreateAlbumData {
  tribeId: string;
  name: string;
  description?: string;
  coverId?: string;
  privacy?: "public" | "private" | "admin_only";
}

export interface UpdateAlbumData {
  name?: string;
  description?: string;
  coverImageUrl?: string;
  privacy?: "public" | "private" | "admin_only";
  coverId?: string;
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
      coverId: albumData.coverId,
      tribeId: albumData.tribeId,
      createdBy: userId,
      name: albumData.name,
      description: albumData.description,
      privacy: albumData.privacy || "public",
    })
    .returning();

  return newAlbum[0];
}

/**
 * Get an album by ID with its media (using junction table)
 * @param albumId - The album ID
 * @returns The album with media or null if not found
 */
export async function getAlbumById(albumId: string): Promise<AlbumWithMedia | null> {
  // Get album with creator, tribe, and cover URL
  const albumRecord = await db
    .select({
      id: album.id,
      tribeId: album.tribeId,
      name: album.name,
      description: album.description,
      coverId: album.coverId,
      privacy: album.privacy,
      createdAt: album.createdAt,
      updatedAt: album.updatedAt,
      createdBy: album.createdBy,
      creator: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        location: user.location,
        profileCompleted: user.profileCompleted,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      tribe: {
        id: tribe.id,
        name: tribe.name,
        description: tribe.description,
        avatar: tribe.avatar,
        location: tribe.location,
        privacy: tribe.privacy,
        category: tribe.category,
        isFeatured: tribe.isFeatured,
        isTrending: tribe.isTrending,
        createdBy: tribe.createdBy,
        createdAt: tribe.createdAt,
        updatedAt: tribe.updatedAt,
      },
      coverUrl: sql<string | null>`${media.fileUrl}`, // Resolved from coverId
    })
    .from(album)
    .innerJoin(user, eq(album.createdBy, user.id))
    .innerJoin(tribe, eq(album.tribeId, tribe.id))
    .leftJoin(media, eq(album.coverId, media.id))
    .where(eq(album.id, albumId))
    .limit(1);

  if (!albumRecord[0]) return null;

  // Get media in album via junction table
  const albumMediaQuery = await db
    .select({
      id: media.id,
      tribeId: media.tribeId,
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
      displayOrder: albumMedia.displayOrder,
    })
    .from(albumMedia)
    .innerJoin(media, eq(albumMedia.mediaId, media.id))
    .leftJoin(mediaLike, eq(media.id, mediaLike.mediaId))
    .where(eq(albumMedia.albumId, albumId))
    .groupBy(media.id, albumMedia.displayOrder)
    .orderBy(asc(albumMedia.displayOrder), desc(media.createdAt));

  return {
    ...albumRecord[0],
    media: albumMediaQuery,
    photoCount: albumMediaQuery.length,
  };
}

/**
 * Get all albums for a tribe
 * OPTIMIZED: Uses LEFT JOIN instead of subquery for media count
 * @param tribeId - The tribe ID
 * @param options - Pagination options
 * @returns Array of albums with media counts and cover image URLs
 */
export async function getAlbumsByTribe(
  tribeId: string,
  options: { limit?: number; offset?: number } = {}
) {
  const { limit = 50, offset = 0 } = options;

  // Subquery to get media count per album
  const mediaCountSubquery = db
    .select({
      albumId: albumMedia.albumId,
      count: count(albumMedia.id).as('count'),
    })
    .from(albumMedia)
    .groupBy(albumMedia.albumId)
    .as('media_counts');

  // Get albums with media counts and cover URLs
  const albums = await db
    .select({
      id: album.id,
      tribeId: album.tribeId,
      name: album.name,
      description: album.description,
      coverImageUrl: media.fileUrl,
      privacy: album.privacy,
      createdAt: album.createdAt,
      updatedAt: album.updatedAt,
      creator: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      mediaCount: sql<number>`COALESCE(${mediaCountSubquery.count}, 0)`,
    })
    .from(album)
    .leftJoin(user, eq(album.createdBy, user.id))
    .leftJoin(media, eq(album.coverId, media.id))
    .leftJoin(mediaCountSubquery, eq(album.id, mediaCountSubquery.albumId))
    .where(eq(album.tribeId, tribeId))
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
/**
 * Add single media to album (uses junction table)
 * @param mediaId - The media ID
 * @param albumId - The album ID  
 * @param userId - The user ID (must be media uploader or admin)
 */
export async function addMediaToAlbum(
  mediaId: string,
  albumId: string,
  userId: string
) {
  const result = await addMultipleMediaToAlbum(albumId, [mediaId], userId);
  return result[0];
}

/**
 * Remove media from album (removes from junction table)
 * @param mediaId - The media ID
 * @param albumId - The album ID
 * @param userId - The user ID (must be album creator or admin)
 */
export async function removeMediaFromAlbum(
  mediaId: string,
  albumId: string,
  userId: string
) {
  // Get album to check permissions
  const albumRecord = await db
    .select()
    .from(album)
    .where(eq(album.id, albumId))
    .limit(1);

  if (!albumRecord[0]) {
    throw new Error("Album not found");
  }

  // Check permissions
  if (albumRecord[0].createdBy !== userId) {
    const hasPermission = await canUserCreateAlbums(albumRecord[0].tribeId, userId);
    if (!hasPermission) {
      throw new Error("User does not have permission to modify this album");
    }
  }

  // Delete from junction table
  await db
    .delete(albumMedia)
    .where(and(
      eq(albumMedia.albumId, albumId),
      eq(albumMedia.mediaId, mediaId)
    ));
}
export async function getAlbumMediaCount(albumId: string): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(albumMedia)
    .where(eq(albumMedia.albumId, albumId));

  return result[0]?.count || 0;
}

// ============================================
// NEW: Many-to-many album-media functions
// ============================================

export interface CreateAlbumWithMediaData {
  tribeId: string;
  name: string;
  description?: string;
  privacy?: "public" | "private" | "admin_only";
  coverId?: string; // Media ID for cover (existing or newly uploaded)
  mediaIds?: string[]; // Media IDs to include
}

/**
 * Add multiple media items to an album in a single transaction
 * @param albumId - The album ID
 * @param mediaIds - Array of media IDs to add
 * @param userId - The user performing the action
 * @returns Array of created album_media records
 */
export async function addMultipleMediaToAlbum(
  albumId: string,
  mediaIds: string[],
  userId: string
): Promise<AlbumMedia[]> {
  // Validate album exists
  const albumRecord = await db
    .select()
    .from(album)
    .where(eq(album.id, albumId))
    .limit(1);

  if (!albumRecord[0]) {
    throw new Error("Album not found");
  }

  // Check permissions
  if (albumRecord[0].createdBy !== userId) {
    const hasPermission = await canUserCreateAlbums(albumRecord[0].tribeId, userId);
    if (!hasPermission) {
      throw new Error("User does not have permission to modify this album");
    }
  }

  // Validate all media exist and belong to tribe
  const mediaRecords = await db
    .select()
    .from(media)
    .where(and(
      inArray(media.id, mediaIds),
      eq(media.tribeId, albumRecord[0].tribeId),
    ));

  if (mediaRecords.length !== mediaIds.length) {
    throw new Error("Some media items not found or not accessible");
  }

  // Insert album_media records (ignore duplicates)
  const albumMediaRecords = await db
    .insert(albumMedia)
    .values(
      mediaIds.map((mediaId, index) => ({
        albumId,
        mediaId,
        addedBy: userId,
        displayOrder: index,
      }))
    )
    .onConflictDoNothing()
    .returning();

  return albumMediaRecords;
}

/**
 * Create album with cover and initial media
 * If coverId is provided and not in mediaIds, automatically add it
 * @param userId - The user creating the album
 * @param albumData - Album data with cover and media
 * @returns The created album with media
 */
export async function createAlbumWithMedia(
  userId: string,
  albumData: CreateAlbumWithMediaData
): Promise<AlbumWithMedia> {
  // Check permissions
  const hasPermission = await canUserCreateAlbums(albumData.tribeId, userId);
  if (!hasPermission) {
    throw new Error("User does not have permission to create albums");
  }

  // Validate cover media if provided
  if (albumData.coverId) {
    const coverMedia = await db
      .select()
      .from(media)
      .where(and(
        eq(media.id, albumData.coverId),
        eq(media.tribeId, albumData.tribeId)
      ))
      .limit(1);

    if (!coverMedia[0]) {
      throw new Error("Cover image not found or not accessible");
    }
  }

  // Create the album
  const newAlbum = await db
    .insert(album)
    .values({
      tribeId: albumData.tribeId,
      createdBy: userId,
      name: albumData.name,
      description: albumData.description,
      coverId: albumData.coverId,
      privacy: albumData.privacy || "public",
    })
    .returning();

  const createdAlbum = newAlbum[0];

  // Prepare media IDs to add
  let mediaIdsToAdd = albumData.mediaIds || [];

  // Automatically add cover to album if not already in mediaIds
  if (albumData.coverId && !mediaIdsToAdd.includes(albumData.coverId)) {
    mediaIdsToAdd = [albumData.coverId, ...mediaIdsToAdd];
  }

  // Add media to album if provided
  if (mediaIdsToAdd.length > 0) {
    await addMultipleMediaToAlbum(createdAlbum.id, mediaIdsToAdd, userId);
  }

  // Fetch and return complete album
  return getAlbumById(createdAlbum.id) as Promise<AlbumWithMedia>;
}
