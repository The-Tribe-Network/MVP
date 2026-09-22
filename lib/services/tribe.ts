import { db, getDbTransaction } from "@/lib/database/client";
import { deleteDraftsForMember } from "@/lib/services/draft";
import { tribe, tribeMember, tribeMemberPermission, tribeMemberPreference, tribeSettings } from "@/lib/database/schemas/tribe";
import { user } from "@/lib/database/schemas/auth";
import { media } from "@/lib/database/schemas/media";
import { event } from "@/lib/database/schemas/event";
import { post } from "@/lib/database/schemas/post";
import { eq, ne, asc, count, and, inArray, aliasedTable, sql } from "drizzle-orm";
import type { TribeInsert, TribeWithCreator, TribeWithMembers, Tribe } from "@/lib/database/types";
import { getMemberWithPermissions } from "./permissions";
import type { UpdateTribeInput } from "@/lib/validations/tribe";
import { userPreviewColumns } from "@/lib/database/user-columns";
import { getAgendaItems, type AgendaItemPreview } from "./event";
import { getTribeAnnouncement, type PostWithMetadata } from "./post";

/**
 * Create a new tribe and add the creator as owner
 * OPTIMIZED: Wrapped in transaction to ensure tribe + owner are created atomically
 */
export async function createTribe(
  data: {
    name: string;
    description?: string;
    avatar?: string;
    banner?: string;
    location?: string;
    privacy?: "private" | "public";
    category?: "social" | "gaming" | "family" | "work" | "hobbies" | "other";
    invitations?: Array<{ email: string; role: "admin" | "moderator" | "member" }>;
  },
  userId: string
): Promise<TribeWithCreator> {
  const dbTx = getDbTransaction();

  // Create tribe and add creator as owner in a transaction
  const createdTribe = await dbTx.transaction(async (tx) => {
    // Insert tribe
    const [newTribe] = await tx
      .insert(tribe)
      .values({
        name: data.name,
        description: data.description || null,
        avatar: data.avatar || null,
        banner: data.banner || null,
        location: data.location || null,
        privacy: data.privacy || "private",
        category: data.category || "other",
        createdBy: userId,
      } as any)
      .returning();

    // Add creator as owner
    await tx.insert(tribeMember).values({
      tribeId: newTribe.id,
      userId: userId,
      role: "owner",
    } as any);

    // Create default tribe settings
    await tx.insert(tribeSettings).values({
      tribeId: newTribe.id,
      // All other fields use schema defaults
    } as any);

    return newTribe;
  });

  // Fetch creator info
  const [creator] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  // Create invitations if provided
  // Wrap in try-catch to ensure tribe creation succeeds even if invitations fail
  if (data.invitations && data.invitations.length > 0) {
    try {
      const { createTribeInvitations } = await import("./invitation");
      await createTribeInvitations(
        createdTribe.id,
        createdTribe.name,
        data.invitations,
        userId,
        creator?.name || "Someone"
      );
    } catch (error) {
      // Log error but don't fail tribe creation
      console.error("Failed to create invitations (tribe was still created):", error);
    }
  }

  return {
    ...createdTribe,
    creator: creator!,
  };
}

/**
 * Get tribe by ID with creator information and member count
 * OPTIMIZED: 2 DB calls instead of 3 (tribe+creator join, then member count in parallel)
 * Resolves avatar and banner IDs to URLs if they exist
 */
export async function getTribeById(id: string, includeAvatar: boolean = false): Promise<TribeWithMembers | null> {
  // Create aliases for media table to join twice (avatar and banner)
  const avatarMedia = aliasedTable(media, "avatar_media");
  const bannerMedia = aliasedTable(media, "banner_media");

  // Fetch tribe with avatar/banner URLs and creator in a single query with joins
  const [tribeData] = await db
    .select({
      id: tribe.id,
      name: tribe.name,
      description: tribe.description,
      avatar: tribe.avatar,
      banner: tribe.banner,
      color: tribe.color,
      location: tribe.location,
      privacy: tribe.privacy,
      category: tribe.category,
      isFeatured: tribe.isFeatured,
      isTrending: tribe.isTrending,
      featuredMediaId: tribe.featuredMediaId,
      createdBy: tribe.createdBy,
      createdAt: tribe.createdAt,
      updatedAt: tribe.updatedAt,
      avatarUrl: avatarMedia.fileUrl,
      bannerUrl: bannerMedia.fileUrl,
      creator: userPreviewColumns,
    })
    .from(tribe)
    .leftJoin(avatarMedia, eq(tribe.avatar, avatarMedia.id))
    .leftJoin(bannerMedia, eq(tribe.banner, bannerMedia.id))
    .innerJoin(user, eq(tribe.createdBy, user.id))
    .where(eq(tribe.id, id))
    .limit(1);

  if (!tribeData) {
    return null;
  }

  // Get member count, event count, and media count in parallel
  const [memberCountResult, eventCountResult, mediaCountResult] = await Promise.all([
    db
      .select({ count: count() })
      .from(tribeMember)
      .where(eq(tribeMember.tribeId, id)),
    db
      .select({ count: count() })
      .from(event)
      .where(eq(event.tribeId, id)),
    db
      .select({ count: count() })
      .from(media)
      .where(eq(media.tribeId, id)),
  ]);

  // Replace avatar/banner IDs with URLs if available
  const { avatarUrl, bannerUrl, creator, ...tribeFields } = tribeData;

  return {
    ...tribeFields,
    avatar: avatarUrl || tribeData.avatar, // Use URL if available, otherwise keep original (null or ID)
    banner: bannerUrl || tribeData.banner, // Use URL if available, otherwise keep original (null or ID)
    creator,
    memberCount: memberCountResult[0]?.count || 0,
    eventCount: eventCountResult[0]?.count || 0,
    mediaCount: mediaCountResult[0]?.count || 0,
  };
}

/** TribeWithCounts in the mobile contract: the detail payload plus the TRIBE-01 announcement. */
export type TribeDetail = TribeWithMembers & {
  announcement: PostWithMetadata | null;
};

/**
 * Tribe detail for GET /tribes/{id}: counts plus the latest pinned post as `announcement` (TRI-149).
 * `currentUserId` drives the announcement's isLiked / poll vote state.
 */
export async function getTribeDetail(id: string, currentUserId?: string): Promise<TribeDetail | null> {
  const [tribeData, announcement] = await Promise.all([
    getTribeById(id),
    getTribeAnnouncement(id, currentUserId),
  ]);

  if (!tribeData) {
    return null;
  }

  return { ...tribeData, announcement };
}

/**
 * Get all tribes a user is a member of
 * Returns basic tribe information (id, name, avatar) for sidebar display
 * Resolves avatar ID to URL if avatar exists
 */
export async function getUserTribes(userId: string): Promise<Array<{ id: string; name: string; avatar: string | null }>> {
  const userTribes = await db
    .select({
      id: tribe.id,
      name: tribe.name,
      avatar: tribe.avatar,
      avatarUrl: media.fileUrl,
    })
    .from(tribeMember)
    .innerJoin(tribe, eq(tribeMember.tribeId, tribe.id))
    .leftJoin(media, eq(tribe.avatar, media.id))
    .where(eq(tribeMember.userId, userId));

  // Replace avatar ID with URL if available
  return userTribes.map(({ avatarUrl, avatar, ...rest }) => ({
    ...rest,
    avatar: avatarUrl || avatar, // Use URL if available, otherwise keep original (null or ID)
  }));
}

/**
 * A tribe as the caller sees it in their tribe list (mobile contract: TribeSummary) — NAV-01 drawer
 * and HOME catch-up rows.
 */
export type TribeSummary = {
  id: string;
  name: string;
  avatar: string | null;
  color: string | null;
  myRole: (typeof tribeMember.$inferSelect)["role"];
  memberCount: number;
  // Posts by other members since the caller last finished catch-up (DATA-MODEL-DELTA §4)
  unreadCount: number;
  lastActivityAt: Date | null;
  nextEvent: AgendaItemPreview | null;
};

// For anyone who has never tapped "Done" on catch-up, unread means the last week — never more than
// the member has been in the tribe. Catch-up (lib/services/agenda.ts) defaults `since` the same way.
export const CATCH_UP_FALLBACK_DAYS = 7;
const UNREAD_FALLBACK = sql`now() - interval '7 days'`;

/**
 * Posts by other members since the caller last finished catch-up, per tribe id (TribeSummary and
 * TribeUnreadSummary `unreadCount`). One query for all memberships; tribes with nothing new are absent.
 */
export async function getUnreadPostCounts(userId: string): Promise<Map<string, number>> {
  const rows = await db
    .select({ tribeId: tribeMember.tribeId, count: sql<number>`count(${post.id})::int` })
    .from(tribeMember)
    .leftJoin(tribeMemberPreference, eq(tribeMemberPreference.tribeMemberId, tribeMember.id))
    .innerJoin(
      post,
      and(
        eq(post.tribeId, tribeMember.tribeId),
        ne(post.authorId, tribeMember.userId),
        sql`${post.createdAt} > greatest(coalesce(${tribeMemberPreference.lastCatchUpAt}, ${UNREAD_FALLBACK}), ${tribeMember.joinedAt})`
      )
    )
    .where(eq(tribeMember.userId, userId))
    .groupBy(tribeMember.tribeId);
  return new Map(rows.map((r) => [r.tribeId, Number(r.count)]));
}

/**
 * HOME-03 "Done": record that the caller has caught up on every tribe they belong to (or one tribe)
 * by stamping `tribe_member_preference.last_catch_up_at`. The preference row is created lazily by
 * the web app, so members without one get a row here. Returns the stamped time, or null when
 * `tribeId` names a tribe the caller is not in.
 */
export async function markCatchUpDone(userId: string, tribeId?: string): Promise<Date | null> {
  const markedAt = new Date();
  const memberships = await db
    .select({ id: tribeMember.id })
    .from(tribeMember)
    .where(
      tribeId
        ? and(eq(tribeMember.userId, userId), eq(tribeMember.tribeId, tribeId))
        : eq(tribeMember.userId, userId)
    );
  if (tribeId && memberships.length === 0) return null;
  if (memberships.length === 0) return markedAt;
  const memberIds = memberships.map((m) => m.id);

  await getDbTransaction().transaction(async (tx) => {
    const updated = await tx
      .update(tribeMemberPreference)
      .set({ lastCatchUpAt: markedAt })
      .where(inArray(tribeMemberPreference.tribeMemberId, memberIds))
      .returning({ tribeMemberId: tribeMemberPreference.tribeMemberId });
    const stamped = new Set(updated.map((u) => u.tribeMemberId));
    const missing = memberIds.filter((id) => !stamped.has(id));
    if (missing.length > 0) {
      await tx
        .insert(tribeMemberPreference)
        .values(missing.map((tribeMemberId) => ({ tribeMemberId, userId, lastCatchUpAt: markedAt })));
    }
  });
  return markedAt;
}

/**
 * The caller's tribes with the counts the tribe list shows. A constant number of queries however
 * many tribes the caller belongs to.
 */
export async function getMyTribeSummaries(userId: string): Promise<TribeSummary[]> {
  const memberships = await db
    .select({
      id: tribe.id,
      name: tribe.name,
      avatar: tribe.avatar,
      avatarUrl: media.fileUrl,
      color: tribe.color,
      myRole: tribeMember.role,
    })
    .from(tribeMember)
    .innerJoin(tribe, eq(tribeMember.tribeId, tribe.id))
    .leftJoin(media, eq(tribe.avatar, media.id))
    .where(eq(tribeMember.userId, userId))
    .orderBy(asc(tribeMember.joinedAt));

  if (memberships.length === 0) return [];
  const tribeIds = memberships.map((m) => m.id);

  const lastCreated = (table: typeof post | typeof event | typeof media) =>
    db
      .select({ tribeId: table.tribeId, at: sql<Date | string | null>`max(${table.createdAt})` })
      .from(table)
      .where(inArray(table.tribeId, tribeIds))
      .groupBy(table.tribeId);

  const [memberCounts, unread, lastPosts, lastEvents, lastMedia, nextEvents] = await Promise.all([
    db
      .select({ tribeId: tribeMember.tribeId, count: count() })
      .from(tribeMember)
      .where(inArray(tribeMember.tribeId, tribeIds))
      .groupBy(tribeMember.tribeId),
    getUnreadPostCounts(userId),
    lastCreated(post),
    lastCreated(event),
    lastCreated(media),
    db
      .selectDistinctOn([event.tribeId], { id: event.id, tribeId: event.tribeId })
      .from(event)
      .where(
        and(
          inArray(event.tribeId, tribeIds),
          sql`${event.startDate} >= now()`,
          ne(event.status, "cancelled")
        )
      )
      .orderBy(event.tribeId, asc(event.startDate)),
  ]);

  const agenda = await getAgendaItems(nextEvents.map((e) => e.id), userId);

  const memberCountMap = new Map(memberCounts.map((r) => [r.tribeId, Number(r.count)]));
  const unreadMap = unread;
  const nextEventMap = new Map(nextEvents.map((e) => [e.tribeId, agenda.get(e.id) ?? null]));

  const lastActivityMap = new Map<string, Date>();
  for (const row of [...lastPosts, ...lastEvents, ...lastMedia]) {
    if (!row.tribeId || !row.at) continue;
    const at = new Date(row.at);
    const current = lastActivityMap.get(row.tribeId);
    if (!current || at > current) lastActivityMap.set(row.tribeId, at);
  }

  return memberships.map(({ avatarUrl, avatar, ...m }) => ({
    ...m,
    avatar: avatarUrl || avatar, // Use URL if available, otherwise keep original (null or ID)
    memberCount: memberCountMap.get(m.id) ?? 0,
    unreadCount: unreadMap.get(m.id) ?? 0,
    lastActivityAt: lastActivityMap.get(m.id) ?? null,
    nextEvent: nextEventMap.get(m.id) ?? null,
  }));
}

/**
 * Remove a user from a tribe (leave tribe)
 * Returns success/error response
 * Prevents owners from leaving without transferring ownership
 */
export async function leaveTribe(
  tribeId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  // Check if user is a member
  const [member] = await db
    .select({ role: tribeMember.role })
    .from(tribeMember)
    .where(and(eq(tribeMember.tribeId, tribeId), eq(tribeMember.userId, userId)))
    .limit(1);

  if (!member) {
    return { success: false, error: "You are not a member of this tribe" };
  }

  // Prevent owners from leaving
  if (member.role === "owner") {
    return {
      success: false,
      error: "Tribe owners cannot leave. Please transfer ownership first.",
    };
  }

  // Delete the member record, and the drafts they were writing for this tribe (TRI-168)
  await db
    .delete(tribeMember)
    .where(and(eq(tribeMember.tribeId, tribeId), eq(tribeMember.userId, userId)));
  await deleteDraftsForMember(userId, tribeId);

  return { success: true };
}

/**
 * Update tribe settings (name, description, avatar, location, category)
 * Requires canEditTribeSettings permission (owner or admin with permission)
 * OPTIMIZED: Returns void - query invalidation handles refetching
 */
export async function updateTribe(
  tribeId: string,
  userId: string,
  data: UpdateTribeInput
): Promise<void> {
  // Check permissions
  const memberData = await getMemberWithPermissions(tribeId, userId);
  if (!memberData) {
    throw new Error("Not a member of this tribe");
  }

  // Check if user can edit tribe settings
  const canEdit =
    memberData.member.role === "owner" ||
    memberData.permissions?.canEditTribeSettings === true ||
    (memberData.member.role === "admin" &&
      memberData.permissions?.canEditTribeSettings !== false);

  if (!canEdit) {
    throw new Error("No permission to edit tribe settings");
  }

  // Build update object with only provided fields
  const updateData: Partial<typeof tribe.$inferInsert> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.avatar !== undefined) updateData.avatar = data.avatar ?? null;
  if (data.banner !== undefined) updateData.banner = data.banner ?? null;
  if (data.location !== undefined) updateData.location = data.location || null;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.privacy !== undefined) updateData.privacy = data.privacy;

  // Update tribe
  const [updatedTribe] = await db
    .update(tribe)
    .set(updateData)
    .where(eq(tribe.id, tribeId))
    .returning();

  if (!updatedTribe) {
    throw new Error("Tribe not found");
  }

  // No need to fetch updated tribe - query invalidation will handle refetching
}

/**
 * Delete a tribe permanently
 * Requires canDeleteTribe permission (owner only by default)
 */
export async function deleteTribe(tribeId: string, userId: string): Promise<void> {
  // Check permissions
  const memberData = await getMemberWithPermissions(tribeId, userId);
  if (!memberData) {
    throw new Error("Not a member of this tribe");
  }

  // Check if user can delete tribe
  const canDelete =
    memberData.member.role === "owner" || memberData.permissions?.canDeleteTribe === true;

  if (!canDelete) {
    throw new Error("No permission to delete tribe");
  }

  // Delete tribe (cascade will handle related records)
  await db.delete(tribe).where(eq(tribe.id, tribeId));
}

/**
 * Transfer tribe ownership to another member
 * Requires canTransferOwnership permission (owner only by default)
 * New owner must be an admin member
 * OPTIMIZED: Single query for both member checks, returns void - query invalidation handles refetching
 */
export async function transferOwnership(
  tribeId: string,
  userId: string,
  newOwnerId: string
): Promise<void> {
  // OPTIMIZED: Fetch both members in a single query
  const members = await db
    .select({
      member: tribeMember,
      permissions: tribeMemberPermission,
    })
    .from(tribeMember)
    .leftJoin(
      tribeMemberPermission,
      eq(tribeMemberPermission.tribeMemberId, tribeMember.id)
    )
    .where(
      and(
        eq(tribeMember.tribeId, tribeId),
        inArray(tribeMember.userId, [userId, newOwnerId])
      )
    );

  // Find current user's member data
  const memberData = members.find((m) => m.member.userId === userId);
  if (!memberData) {
    throw new Error("Not a member of this tribe");
  }

  // Check if user can transfer ownership
  const canTransfer =
    memberData.member.role === "owner" ||
    memberData.permissions?.canTransferOwnership === true;

  if (!canTransfer) {
    throw new Error("No permission to transfer ownership");
  }

  // Find new owner's member data
  const newOwnerData = members.find((m) => m.member.userId === newOwnerId);
  if (!newOwnerData) {
    throw new Error("New owner is not a member of this tribe");
  }

  if (newOwnerData.member.role !== "admin") {
    throw new Error("New owner must be an admin member");
  }

  // Transfer ownership in a transaction
  const dbTx = getDbTransaction();
  await dbTx.transaction(async (tx) => {
    // Update current owner to admin
    await tx
      .update(tribeMember)
      .set({ role: "admin" })
      .where(
        and(eq(tribeMember.tribeId, tribeId), eq(tribeMember.userId, userId))
      );

    // Update new owner to owner
    await tx
      .update(tribeMember)
      .set({ role: "owner" })
      .where(
        and(eq(tribeMember.tribeId, tribeId), eq(tribeMember.userId, newOwnerId))
      );

    // Update tribe createdBy (for consistency)
    await tx.update(tribe).set({ createdBy: newOwnerId }).where(eq(tribe.id, tribeId));
  });

  // No need to fetch updated tribe - query invalidation will handle refetching
}

/**
 * Get admin members of a tribe (for transfer ownership selection)
 */
export async function getTribeAdminMembers(tribeId: string): Promise<Array<{ id: string; name: string; username: string | null; image: string | null }>> {
  const adminMembers = await db
    .select({
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
    })
    .from(tribeMember)
    .innerJoin(user, eq(tribeMember.userId, user.id))
    .where(and(eq(tribeMember.tribeId, tribeId), eq(tribeMember.role, "admin")))
    .limit(50);

  return adminMembers;
}

/**
 * Featured media type with uploader info
 */
export type FeaturedMediaWithUploader = {
  id: string;
  fileUrl: string;
  altText: string | null;
  likeCount: number;
  createdAt: Date;
  albumId: string | null;
  albumName: string | null;
  uploader: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
  };
};

/**
 * Get the featured media for a tribe
 * Returns null if no featured media is set
 */
export async function getFeaturedMedia(tribeId: string): Promise<FeaturedMediaWithUploader | null> {
  const { album, albumMedia, mediaLike } = await import("@/lib/database/schemas/media");

  // First get the tribe's featured media ID
  const [tribeData] = await db
    .select({ featuredMediaId: tribe.featuredMediaId })
    .from(tribe)
    .where(eq(tribe.id, tribeId))
    .limit(1);

  if (!tribeData?.featuredMediaId) {
    return null;
  }

  // Get media with uploader info
  const [featuredMedia] = await db
    .select({
      id: media.id,
      fileUrl: media.fileUrl,
      altText: media.altText,
      createdAt: media.createdAt,
      uploader: {
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
      },
    })
    .from(media)
    .innerJoin(user, eq(media.uploadedBy, user.id))
    .where(eq(media.id, tribeData.featuredMediaId))
    .limit(1);

  if (!featuredMedia) {
    return null;
  }

  // Get album info through junction table (if any)
  const [albumInfo] = await db
    .select({
      albumId: albumMedia.albumId,
      albumName: album.name,
    })
    .from(albumMedia)
    .leftJoin(album, eq(albumMedia.albumId, album.id))
    .where(eq(albumMedia.mediaId, featuredMedia.id))
    .limit(1);

  // Get like count
  const [likeCountResult] = await db
    .select({ count: count() })
    .from(mediaLike)
    .where(eq(mediaLike.mediaId, featuredMedia.id));

  return {
    ...featuredMedia,
    albumId: albumInfo?.albumId || null,
    albumName: albumInfo?.albumName || null,
    likeCount: likeCountResult?.count || 0,
  };
}

/**
 * Set the featured media for a tribe
 * Requires admin permissions (owner, admin, or moderator)
 */
export async function setFeaturedMedia(
  tribeId: string,
  mediaId: string,
  userId: string
): Promise<void> {
  // Check permissions - only admins can set featured media
  const memberData = await getMemberWithPermissions(tribeId, userId);
  if (!memberData) {
    throw new Error("Not a member of this tribe");
  }

  const isAdmin = ["owner", "admin", "moderator"].includes(memberData.member.role);
  if (!isAdmin) {
    throw new Error("Only admins can set featured media");
  }

  // Verify the media exists and belongs to this tribe
  const [mediaRecord] = await db
    .select({ id: media.id })
    .from(media)
    .where(and(eq(media.id, mediaId), eq(media.tribeId, tribeId)))
    .limit(1);

  if (!mediaRecord) {
    throw new Error("Media not found or does not belong to this tribe");
  }

  // Update the tribe's featured media
  await db
    .update(tribe)
    .set({ featuredMediaId: mediaId })
    .where(eq(tribe.id, tribeId));
}

/**
 * Clear the featured media for a tribe
 * Requires admin permissions (owner, admin, or moderator)
 */
export async function clearFeaturedMedia(
  tribeId: string,
  userId: string
): Promise<void> {
  // Check permissions - only admins can clear featured media
  const memberData = await getMemberWithPermissions(tribeId, userId);
  if (!memberData) {
    throw new Error("Not a member of this tribe");
  }

  const isAdmin = ["owner", "admin", "moderator"].includes(memberData.member.role);
  if (!isAdmin) {
    throw new Error("Only admins can clear featured media");
  }

  // Clear the tribe's featured media
  await db
    .update(tribe)
    .set({ featuredMediaId: null })
    .where(eq(tribe.id, tribeId));
}

