import { db } from "@/lib/database/client";
import { tribeMember, tribeMemberPermission } from "@/lib/database/schemas/tribe";
import { media } from "@/lib/database/schemas/media";
import { eq, and } from "drizzle-orm";

/**
 * Type for member with permissions data
 */
export type MemberWithPermissions = {
  member: typeof tribeMember.$inferSelect;
  permissions: typeof tribeMemberPermission.$inferSelect | null;
};

/**
 * Get tribe member with permissions in a single query (OPTIMIZED)
 * This replaces the pattern of calling checkTribeMembership + separate permission query
 * Reduces 3 DB calls to 1 DB call
 */
export async function getMemberWithPermissions(
  tribeId: string,
  userId: string
): Promise<MemberWithPermissions | null> {
  const result = await db
    .select({
      member: tribeMember,
      permissions: tribeMemberPermission,
    })
    .from(tribeMember)
    .leftJoin(
      tribeMemberPermission,
      eq(tribeMemberPermission.tribeMemberId, tribeMember.id)
    )
    .where(and(eq(tribeMember.tribeId, tribeId), eq(tribeMember.userId, userId)))
    .limit(1);

  if (!result[0]) return null;

  return {
    member: result[0].member,
    permissions: result[0].permissions,
  };
}

/**
 * Check if a user is a member of a tribe
 * NOTE: Consider using getMemberWithPermissions() if you need member data afterward
 * to avoid duplicate queries
 */
export async function checkTribeMembership(
  tribeId: string,
  userId: string
): Promise<boolean> {
  const member = await db
    .select()
    .from(tribeMember)
    .where(and(eq(tribeMember.tribeId, tribeId), eq(tribeMember.userId, userId)))
    .limit(1);

  return member.length > 0;
}

/**
 * Get user's role in a tribe
 * NOTE: Consider using getMemberWithPermissions() if you need more member data
 * to avoid duplicate queries
 */
export async function getUserTribeRole(
  tribeId: string,
  userId: string
): Promise<string | null> {
  const member = await db
    .select({ role: tribeMember.role })
    .from(tribeMember)
    .where(and(eq(tribeMember.tribeId, tribeId), eq(tribeMember.userId, userId)))
    .limit(1);

  return member[0]?.role || null;
}

/**
 * Check if a user can upload media to a tribe
 * OPTIMIZED: 1 DB call instead of 3
 * @param tribeId - The tribe ID
 * @param userId - The user ID
 * @returns true if user can upload media, false otherwise
 */
export async function canUserUploadMedia(
  tribeId: string,
  userId: string
): Promise<boolean> {
  // Get member and permissions in a single query
  const memberData = await getMemberWithPermissions(tribeId, userId);
  if (!memberData) return false;

  // If permission override exists and is false, deny
  if (memberData.permissions?.canUploadMedia === false) return false;

  // If permission override exists and is true, allow
  if (memberData.permissions?.canUploadMedia === true) return true;

  // Default: allow all members to upload media
  return true;
}

/**
 * Check if a user can create albums in a tribe
 * OPTIMIZED: 1 DB call instead of 3
 * @param tribeId - The tribe ID
 * @param userId - The user ID
 * @returns true if user can create albums, false otherwise
 */
export async function canUserCreateAlbums(
  tribeId: string,
  userId: string
): Promise<boolean> {
  // Get member and permissions in a single query
  const memberData = await getMemberWithPermissions(tribeId, userId);
  if (!memberData) return false;

  // If permission override exists and is false, deny
  if (memberData.permissions?.canCreateAlbums === false) return false;

  // If permission override exists and is true, allow
  if (memberData.permissions?.canCreateAlbums === true) return true;

  // Default: allow all members to create albums
  return true;
}

/**
 * Check if a user can delete a specific media
 * OPTIMIZED: 2 DB calls instead of 5 (parallel queries)
 * @param tribeId - The tribe ID
 * @param userId - The user ID
 * @param mediaId - The media ID
 * @returns true if user can delete the media, false otherwise
 */
export async function canUserDeleteMedia(
  tribeId: string,
  userId: string,
  mediaId: string
): Promise<boolean> {
  // Fetch member+permissions and media in parallel (2 DB calls instead of 5)
  const [memberData, mediaRecord] = await Promise.all([
    getMemberWithPermissions(tribeId, userId),
    db.select().from(media).where(eq(media.id, mediaId)).limit(1),
  ]);

  if (!memberData || !mediaRecord[0]) return false;

  // Check if user is the uploader
  const isOwner = mediaRecord[0].uploadedBy === userId;

  // Check if user has permission to delete any media (admin/mod)
  if (memberData.permissions?.canDeleteAnyMedia === true) return true;

  // Check role-based permissions for moderators and admins
  const role = memberData.member.role;
  if (role === "owner" || role === "admin") return true;

  // If user is the owner of the media
  if (isOwner) {
    // Check if canDeleteOwnMedia permission override is false
    if (memberData.permissions?.canDeleteOwnMedia === false) return false;
    // Default: allow users to delete their own media
    return true;
  }

  // Not the owner and no special permissions
  return false;
}

