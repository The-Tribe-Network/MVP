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
 * Uses three-layer permission resolution
 * @param tribeId - The tribe ID
 * @param userId - The user ID
 * @returns true if user can upload media, false otherwise
 */
export async function canUserUploadMedia(
  tribeId: string,
  userId: string
): Promise<boolean> {
  const { checkPermission } = await import("./role-permissions");
  return checkPermission(tribeId, userId, "canUploadMedia");
}

/**
 * Check if a user can create albums in a tribe
 * Uses three-layer permission resolution
 * @param tribeId - The tribe ID
 * @param userId - The user ID
 * @returns true if user can create albums, false otherwise
 */
export async function canUserCreateAlbums(
  tribeId: string,
  userId: string
): Promise<boolean> {
  const { checkPermission } = await import("./role-permissions");
  return checkPermission(tribeId, userId, "canCreateAlbums");
}

/**
 * Check if a user can delete a specific media
 * Uses three-layer permission resolution for permission checks
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
  const { checkPermission } = await import("./role-permissions");

  // Fetch member+permissions and media in parallel
  const [memberData, mediaRecord] = await Promise.all([
    getMemberWithPermissions(tribeId, userId),
    db.select().from(media).where(eq(media.id, mediaId)).limit(1),
  ]);

  if (!memberData || !mediaRecord[0]) return false;

  // The caller's rights in `tribeId` never reach media of another tribe (TRI-197).
  if (mediaRecord[0].tribeId !== tribeId) return false;

  const isOwner = mediaRecord[0].uploadedBy === userId;
  const role = memberData.member.role;

  // Admins and owners can always delete
  if (role === "owner" || role === "admin") return true;

  // Check if user has permission to delete any media
  const canDeleteAny = await checkPermission(tribeId, userId, "canDeleteAnyMedia");
  if (canDeleteAny) return true;

  // If user is the owner of the media, check canDeleteOwnMedia permission
  if (isOwner) {
    return checkPermission(tribeId, userId, "canDeleteOwnMedia");
  }

  return false;
}

