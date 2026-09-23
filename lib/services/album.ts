import { db } from "@/lib/database/client";
import { album, albumMedia, media, mediaLike } from "@/lib/database/schemas/media";
import { user } from "@/lib/database/schemas/auth";
import { tribe, tribeMember, tribeMemberPreference } from "@/lib/database/schemas/tribe";
import { eq, and, desc, sql, count, countDistinct, inArray, asc, lte } from "drizzle-orm";
import { canUserCreateAlbums } from "./permissions";
import { checkPermission } from "./role-permissions";
import type { AlbumMedia, AlbumWithMedia, UserPreview } from "@/lib/database/types";
import { userPreviewColumns } from "@/lib/database/user-columns";

/** How far back "new" reaches on a member's first visit to an album (MEDIA-02 "NEW TODAY"). */
const FIRST_VISIT_NEW_WINDOW_MS = 24 * 60 * 60 * 1000;

/** How many contributors an album carries inline (the contract's `Album.contributors` maxItems). */
const CONTRIBUTORS_LIMIT = 3;

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
  privacy?: "public" | "private" | "admin_only";
  /** A media id in the album's tribe (MEDIA-07). */
  coverId?: string;
}

/**
 * The permission key that lets a member who did not create an album manage it (TRI-205): update its
 * details or cover, delete it, and add or remove its media. There is no album-specific moderation key in
 * the role matrix (`canCreateAlbums` is the only album key, and it is a creation right), so this is
 * `canDeleteAnyMedia`: the owner/admin tier that the mobile MEDIA-02 menu ("Manage", "Delete album")
 * already gates on. Resolved through `checkPermission` (per-member override → tribe role → system default).
 */
export const ALBUM_MANAGE_PERMISSION = "canDeleteAnyMedia";

/** The album columns the write guards need. */
type AlbumWriteTarget = Pick<typeof album.$inferSelect, "id" | "tribeId" | "createdBy">;

/**
 * Load an album for a write. Throws "Album not found" (routes answer 404) and, when `tribeId` is given
 * and differs from the album's tribe, "Album does not belong to this tribe" (routes answer 403) before
 * any permission is resolved, so a caller's rights in tribe A never reach an album in tribe B.
 */
async function getAlbumForWrite(albumId: string, tribeId?: string) {
  const [albumRecord] = await db.select().from(album).where(eq(album.id, albumId)).limit(1);
  if (!albumRecord) {
    throw new Error("Album not found");
  }
  if (tribeId !== undefined && albumRecord.tribeId !== tribeId) {
    throw new Error("Album does not belong to this tribe");
  }
  return albumRecord;
}

/**
 * Whether a user may manage an album: its creator, or a member of the album's tribe whose effective
 * permissions include `ALBUM_MANAGE_PERMISSION`. Non-members resolve false.
 */
export async function canUserManageAlbum(
  albumRecord: AlbumWriteTarget,
  userId: string
): Promise<boolean> {
  if (albumRecord.createdBy === userId) return true;
  return checkPermission(albumRecord.tribeId, userId, ALBUM_MANAGE_PERMISSION);
}

/**
 * Whether a user may add media to or remove media from an album: anyone who may manage it, plus (the
 * pre-existing, broader rule for album contents) any member who holds `canCreateAlbums`.
 */
async function canUserEditAlbumContents(
  albumRecord: AlbumWriteTarget,
  userId: string
): Promise<boolean> {
  if (await canUserManageAlbum(albumRecord, userId)) return true;
  return canUserCreateAlbums(albumRecord.tribeId, userId);
}

/** Throws unless `coverId` is a media row in the tribe (the same rule `createAlbumWithMedia` applies). */
async function assertCoverInTribe(coverId: string, tribeId: string): Promise<void> {
  const [coverMediaRecord] = await db
    .select({ id: media.id })
    .from(media)
    .where(and(eq(media.id, coverId), eq(media.tribeId, tribeId)))
    .limit(1);
  if (!coverMediaRecord) {
    throw new Error("Cover image not found or not accessible");
  }
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

export interface GetAlbumOptions {
  /**
   * The member viewing the album. When set, each media item gets `isNew` from the viewer's previous
   * visit to this album and the visit is stamped (`tribe_member_preference.last_album_visit_at`).
   * Internal callers (create, add/remove media) leave it unset: no stamp, `isNew` false throughout.
   */
  viewerId?: string;
  /**
   * The tribe id from the route. When it differs from the album's tribe the route answers 403, so
   * nothing is marked or stamped for that request.
   */
  tribeId?: string;
}

/**
 * Get an album by ID with its media (using junction table), contributors and, for a viewer, `isNew`.
 * @param albumId - The album ID
 * @param options - See GetAlbumOptions
 * @returns The album with media or null if not found
 */
export async function getAlbumById(
  albumId: string,
  options: GetAlbumOptions = {}
): Promise<AlbumWithMedia | null> {
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
      creator: userPreviewColumns,
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
        featuredMediaId: tribe.featuredMediaId,
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

  // Get media in album via junction table, with each item's uploader (one join, no per-item lookups)
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
      blurhash: media.blurhash,
      createdAt: media.createdAt,
      uploadedBy: media.uploadedBy,
      postId: media.postId,
      likeCount: count(mediaLike.id),
      displayOrder: albumMedia.displayOrder,
      addedAt: albumMedia.addedAt,
      uploader: userPreviewColumns,
    })
    .from(albumMedia)
    .innerJoin(media, eq(albumMedia.mediaId, media.id))
    .innerJoin(user, eq(media.uploadedBy, user.id))
    .leftJoin(mediaLike, eq(media.id, mediaLike.mediaId))
    .where(eq(albumMedia.albumId, albumId))
    .groupBy(media.id, albumMedia.id, user.id)
    .orderBy(asc(albumMedia.displayOrder), desc(media.createdAt));

  // "New" is relative to the viewer's previous visit; computed before the visit is stamped below so
  // this response still shows the items, and the next GET shows them as seen.
  const viewing =
    options.viewerId && (!options.tribeId || options.tribeId === albumRecord[0].tribeId);
  const visit = viewing ? await getAlbumVisit(options.viewerId!, albumRecord[0].tribeId) : null;
  const newSince = visit ? newSinceFor(visit.lastAlbumVisitAt?.[albumId]) : null;

  const mediaItems = albumMediaQuery.map(({ addedAt, ...item }) => ({
    ...item,
    isNew: newSince !== null && addedAt.getTime() > newSince.getTime(),
  }));

  if (visit) {
    await stampAlbumVisit(visit, options.viewerId!, albumId);
  }

  return {
    ...albumRecord[0],
    media: mediaItems,
    photoCount: mediaItems.length,
    ...contributorsFromMedia(albumMediaQuery),
  };
}

/** The viewer's membership row and preference row (if any) for the album's tribe. */
interface AlbumVisit {
  tribeMemberId: string;
  preferenceId: string | null;
  lastAlbumVisitAt: Record<string, string> | null;
}

async function getAlbumVisit(userId: string, tribeId: string): Promise<AlbumVisit | null> {
  const rows = await db
    .select({
      tribeMemberId: tribeMember.id,
      preferenceId: tribeMemberPreference.id,
      lastAlbumVisitAt: tribeMemberPreference.lastAlbumVisitAt,
    })
    .from(tribeMember)
    .leftJoin(tribeMemberPreference, eq(tribeMemberPreference.tribeMemberId, tribeMember.id))
    .where(and(eq(tribeMember.tribeId, tribeId), eq(tribeMember.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * The cut-off after which an album item counts as new for this viewer: their previous visit, or on a
 * first visit (no stamp, or an unreadable one) the last 24 hours, so "NEW TODAY" means what it says.
 */
function newSinceFor(previousVisit: string | undefined): Date {
  const previous = previousVisit ? new Date(previousVisit) : null;
  if (previous && !Number.isNaN(previous.getTime())) return previous;
  return new Date(Date.now() - FIRST_VISIT_NEW_WINDOW_MS);
}

/**
 * Record that the viewer opened the album now. One statement: merges into the existing jsonb so a
 * concurrent visit to another album in the same tribe is not clobbered; inserts the preference row
 * when the member has none yet.
 */
async function stampAlbumVisit(visit: AlbumVisit, userId: string, albumId: string): Promise<void> {
  const stamp = { [albumId]: new Date().toISOString() };
  if (visit.preferenceId) {
    await db
      .update(tribeMemberPreference)
      .set({
        lastAlbumVisitAt: sql`COALESCE(${tribeMemberPreference.lastAlbumVisitAt}, '{}'::jsonb) || ${JSON.stringify(stamp)}::jsonb`,
      })
      .where(eq(tribeMemberPreference.id, visit.preferenceId));
  } else {
    await db
      .insert(tribeMemberPreference)
      .values({ tribeMemberId: visit.tribeMemberId, userId, lastAlbumVisitAt: stamp });
  }
}

/** Distinct uploaders from an already-loaded media list, most recent contribution first. */
function contributorsFromMedia(
  items: { uploadedBy: string; addedAt: Date; uploader: UserPreview }[]
): { contributors: UserPreview[]; contributorCount: number } {
  const latest = new Map<string, { at: number; uploader: UserPreview }>();
  for (const item of items) {
    const at = item.addedAt.getTime();
    const seen = latest.get(item.uploadedBy);
    if (!seen || at > seen.at) latest.set(item.uploadedBy, { at, uploader: item.uploader });
  }
  const contributors = [...latest.values()]
    .sort((a, b) => b.at - a.at)
    .slice(0, CONTRIBUTORS_LIMIT)
    .map((entry) => entry.uploader);
  return { contributors, contributorCount: latest.size };
}

/**
 * Get all albums for a tribe
 * OPTIMIZED: Uses LEFT JOIN instead of subquery for media count
 * @param tribeId - The tribe ID
 * @param options - Pagination options
 * @returns Array of albums with media counts, contributor counts, top contributors and cover image URLs
 */
export async function getAlbumsByTribe(
  tribeId: string,
  options: { limit?: number; offset?: number } = {}
) {
  const { limit = 50, offset = 0 } = options;

  // Subquery to get media count and distinct uploader count per album
  const mediaCountSubquery = db
    .select({
      albumId: albumMedia.albumId,
      count: count(albumMedia.id).as('count'),
      contributorCount: countDistinct(media.uploadedBy).as('contributor_count'),
    })
    .from(albumMedia)
    .innerJoin(media, eq(albumMedia.mediaId, media.id))
    .groupBy(albumMedia.albumId)
    .as('media_counts');

  // Get albums with media counts and cover URLs (matches AlbumWithMedia type)
  const albums = await db
    .select({
      id: album.id,
      tribeId: album.tribeId,
      name: album.name,
      description: album.description,
      coverId: album.coverId,
      coverUrl: media.fileUrl,
      privacy: album.privacy,
      createdAt: album.createdAt,
      updatedAt: album.updatedAt,
      createdBy: album.createdBy,
      creator: userPreviewColumns,
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
        featuredMediaId: tribe.featuredMediaId,
        createdBy: tribe.createdBy,
        createdAt: tribe.createdAt,
        updatedAt: tribe.updatedAt,
      },
      photoCount: sql<number>`COALESCE(${mediaCountSubquery.count}, 0)::int`,
      contributorCount: sql<number>`COALESCE(${mediaCountSubquery.contributorCount}, 0)::int`,
      media: sql<any>`'[]'::json`, // Empty array for list view
    })
    .from(album)
    .leftJoin(user, eq(album.createdBy, user.id))
    .innerJoin(tribe, eq(album.tribeId, tribe.id))
    .leftJoin(media, eq(album.coverId, media.id))
    .leftJoin(mediaCountSubquery, eq(album.id, mediaCountSubquery.albumId))
    .where(eq(album.tribeId, tribeId))
    .orderBy(desc(album.createdAt))
    .limit(limit)
    .offset(offset);

  const contributorsByAlbum = await getTopContributors(albums.map((a) => a.id));

  return albums.map((a) => ({
    ...a,
    contributors: contributorsByAlbum.get(a.id) ?? [],
  }));
}

/**
 * Up to 3 distinct uploaders per album, most recent contribution first, for a page of albums in one
 * grouped query: rank uploaders per album by their latest `album_media.added_at`, keep rank <= 3.
 */
async function getTopContributors(albumIds: string[]): Promise<Map<string, UserPreview[]>> {
  const byAlbum = new Map<string, UserPreview[]>();
  if (albumIds.length === 0) return byAlbum;

  const ranked = db
    .select({
      albumId: albumMedia.albumId,
      uploadedBy: media.uploadedBy,
      rank: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${albumMedia.albumId} ORDER BY MAX(${albumMedia.addedAt}) DESC)`.as('rank'),
    })
    .from(albumMedia)
    .innerJoin(media, eq(albumMedia.mediaId, media.id))
    .where(inArray(albumMedia.albumId, albumIds))
    .groupBy(albumMedia.albumId, media.uploadedBy)
    .as('ranked');

  const rows = await db
    .select({
      albumId: ranked.albumId,
      rank: ranked.rank,
      id: user.id,
      name: user.name,
      image: user.image,
    })
    .from(ranked)
    .innerJoin(user, eq(ranked.uploadedBy, user.id))
    .where(lte(ranked.rank, CONTRIBUTORS_LIMIT))
    .orderBy(asc(ranked.albumId), asc(ranked.rank));

  for (const row of rows) {
    if (!row.albumId) continue;
    const list = byAlbum.get(row.albumId) ?? [];
    list.push({ id: row.id, name: row.name, image: row.image });
    byAlbum.set(row.albumId, list);
  }
  return byAlbum;
}

/**
 * Update an album's details, privacy or cover
 * @param albumId - The album ID
 * @param userId - The user ID (creator, or a member with `ALBUM_MANAGE_PERMISSION`)
 * @param updateData - The data to update
 * @param options.tribeId - The tribe id from the route; a mismatch throws before any permission check
 * @returns The updated album
 */
export async function updateAlbum(
  albumId: string,
  userId: string,
  updateData: UpdateAlbumData,
  options: { tribeId?: string } = {}
) {
  const albumRecord = await getAlbumForWrite(albumId, options.tribeId);

  if (!(await canUserManageAlbum(albumRecord, userId))) {
    throw new Error("User does not have permission to update this album");
  }

  if (updateData.coverId !== undefined) {
    await assertCoverInTribe(updateData.coverId, albumRecord.tribeId);
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
 * Delete an album (its album_media rows cascade; the media rows stay)
 * @param albumId - The album ID
 * @param userId - The user ID (creator, or a member with `ALBUM_MANAGE_PERMISSION`)
 * @param options.tribeId - The tribe id from the route; a mismatch throws before any permission check
 */
export async function deleteAlbum(
  albumId: string,
  userId: string,
  options: { tribeId?: string } = {}
) {
  const albumRecord = await getAlbumForWrite(albumId, options.tribeId);

  if (!(await canUserManageAlbum(albumRecord, userId))) {
    throw new Error("User does not have permission to delete this album");
  }

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
 * @param userId - The user ID (creator, `ALBUM_MANAGE_PERMISSION`, or `canCreateAlbums`)
 */
export async function removeMediaFromAlbum(
  mediaId: string,
  albumId: string,
  userId: string
) {
  const albumRecord = await getAlbumForWrite(albumId);

  if (!(await canUserEditAlbumContents(albumRecord, userId))) {
    throw new Error("User does not have permission to modify this album");
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
  isNewCover?: boolean; // If true, the cover is a new upload and we query the normal media table instead of the album media table
}

/**
 * Add multiple media items to an album in a single transaction
 * @param albumId - The album ID
 * @param mediaIds - Array of media IDs to add
 * @param userId - The user performing the action (creator, `ALBUM_MANAGE_PERMISSION`, or `canCreateAlbums`)
 * @returns Array of created album_media records
 */
export async function addMultipleMediaToAlbum(
  albumId: string,
  mediaIds: string[],
  userId: string
): Promise<AlbumMedia[]> {
  const albumRecord = await getAlbumForWrite(albumId);

  if (!(await canUserEditAlbumContents(albumRecord, userId))) {
    throw new Error("User does not have permission to modify this album");
  }

  // Validate all media exist and belong to tribe
  const mediaRecords = await db
    .select()
    .from(media)
    .where(and(
      inArray(media.id, mediaIds),
      eq(media.tribeId, albumRecord.tribeId),
    ));

  if (mediaRecords.length !== mediaIds.length) {
    console.error(`Media records length mismatch: ${mediaRecords.length} !== ${mediaIds.length}`);
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
    const coverMediaRecord = await db
      .select()
      .from(media)
      .where(and(
        eq(media.id, albumData.coverId),
        eq(media.tribeId, albumData.tribeId)
      ))
      .limit(1);

    if (!coverMediaRecord[0]) {
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
