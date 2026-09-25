import { db } from "@/lib/database/client";
import { tribeMember, tribeMemberPermission } from "@/lib/database/schemas/tribe";
import { user } from "@/lib/database/schemas/auth";
import { eq, and, or, ilike, isNotNull } from "drizzle-orm";
import { applyPermissionLevels, getPermissionLevels, getRolePermissions } from "./role-permissions";
import type {
  TribeMemberWithPermissionsExtended,
  MemberPermissionDetail,
  UserWithUsername,
} from "@/lib/database/types";
import type { MemberWithPermissions } from "./permissions";

/**
 * Get tribe members with custom permission overrides
 *
 * Returns only members who have individual permission overrides.
 * Optimized with joins to fetch member, user, and permission data in one query.
 *
 * @param tribeId - The tribe ID
 * @param options - Optional filters (search by name/username, filter by role)
 * @returns Array of members with their permission overrides
 */
export async function getTribeMembersWithPermissions(
  tribeId: string,
  options?: { search?: string; role?: string }
): Promise<TribeMemberWithPermissionsExtended[]> {
  let query = db
    .select({
      member: tribeMember,
      permissions: tribeMemberPermission,
      user: {
        id: user.id,
        name: user.name,
        displayName: user.displayName,
        username: user.username,
        image: user.image,
      },
    })
    .from(tribeMember)
    .innerJoin(
      tribeMemberPermission,
      eq(tribeMemberPermission.tribeMemberId, tribeMember.id)
    )
    .innerJoin(user, eq(user.id, tribeMember.userId))
    .where(eq(tribeMember.tribeId, tribeId))
    .$dynamic();

  // Add search filter
  if (options?.search) {
    query = query.where(
      or(
        ilike(user.name, `%${options.search}%`),
        ilike(user.username, `%${options.search}%`)
      )
    );
  }

  // Add role filter
  if (options?.role) {
    query = query.where(eq(tribeMember.role, options.role as any));
  }

  const results = await query;

  return results.map((row) => ({
    ...row.member,
    permissions: row.permissions,
    user: row.user as UserWithUsername,
    hasOverrides: true, // Always true since we're only fetching members with overrides
  }));
}

/**
 * Resolve every permission key for a member with checkPermission semantics:
 * individual override → tribe role default → system default, then the tribe's level settings
 * (`postingPermissionLevel` etc.) turn off what the member's role is below.
 *
 * @param tribeId - The tribe ID
 * @param memberData - The member row and its individual overrides
 * @returns The role defaults (the role layer only, without levels) and the fully resolved permission set
 */
export async function resolveEffectivePermissions(
  tribeId: string,
  memberData: MemberWithPermissions
): Promise<{ roleDefaults: Record<string, boolean>; effectivePermissions: Record<string, boolean> }> {
  const [roleDefaults, levels] = await Promise.all([
    getRolePermissions(tribeId, memberData.member.role),
    getPermissionLevels(tribeId),
  ]);

  const effectivePermissions: Record<string, boolean> = { ...roleDefaults };
  if (memberData.permissions) {
    Object.keys(effectivePermissions).forEach((key) => {
      const overrideValue = (memberData.permissions as any)![key];
      if (overrideValue !== null && overrideValue !== undefined) {
        effectivePermissions[key] = overrideValue === true;
      }
    });
  }
  applyPermissionLevels(effectivePermissions, memberData.member.role, levels);

  return { roleDefaults, effectivePermissions };
}

/**
 * Get detailed permission information for a specific member
 *
 * Returns:
 * - Member info
 * - Individual permission overrides
 * - Role default permissions
 * - Effective permissions (combination of overrides + defaults)
 *
 * @param tribeId - The tribe ID
 * @param userId - The user ID
 * @returns Detailed member permission info, or null if not found
 */
export async function getMemberPermissionsDetail(
  tribeId: string,
  userId: string
): Promise<MemberPermissionDetail | null> {
  // Import here to avoid circular dependency
  const { getMemberWithPermissions } = await import("./permissions");

  const memberData = await getMemberWithPermissions(tribeId, userId);
  if (!memberData) return null;

  const { roleDefaults, effectivePermissions } = await resolveEffectivePermissions(
    tribeId,
    memberData
  );

  // Fetch user info
  const [userInfo] = await db
    .select({
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      username: user.username,
      image: user.image,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userInfo) return null;

  return {
    member: memberData.member,
    user: userInfo as UserWithUsername,
    individualOverrides: memberData.permissions,
    roleDefaults,
    effectivePermissions,
    hasOverrides: memberData.permissions !== null,
  };
}

/**
 * Update individual member permissions
 *
 * Updates or creates permission overrides for a specific member.
 * Null values mean "use role default".
 *
 * @param tribeId - The tribe ID
 * @param userId - The user ID
 * @param permissions - Permission overrides (null = use role default)
 * @param restrictionReason - Optional reason for restrictions
 * @param setBy - User ID making the change
 * @throws Error if member not found
 */
export async function updateMemberPermissions(
  tribeId: string,
  userId: string,
  permissions: Record<string, boolean | null>,
  restrictionReason: string | null,
  setBy: string
): Promise<void> {
  // Import here to avoid circular dependency
  const { getMemberWithPermissions } = await import("./permissions");

  const memberData = await getMemberWithPermissions(tribeId, userId);
  if (!memberData) {
    throw new Error("Member not found");
  }

  const updateData: any = {
    ...permissions,
    restrictionReason,
    updatedAt: new Date(),
  };

  if (memberData.permissions) {
    // Update existing permissions
    await db
      .update(tribeMemberPermission)
      .set(updateData)
      .where(eq(tribeMemberPermission.id, memberData.permissions.id));
  } else {
    // Create new permission record
    await db.insert(tribeMemberPermission).values({
      tribeMemberId: memberData.member.id,
      tribeId,
      userId,
      ...permissions,
      restrictionReason,
      setBy,
    } as any);
  }
}

/**
 * Reset member permissions to role defaults
 *
 * Deletes all individual permission overrides for a member.
 * Member will use their role's default permissions after this.
 *
 * @param tribeId - The tribe ID
 * @param userId - The user ID
 */
export async function resetMemberPermissions(tribeId: string, userId: string): Promise<void> {
  // Import here to avoid circular dependency
  const { getMemberWithPermissions } = await import("./permissions");

  const memberData = await getMemberWithPermissions(tribeId, userId);
  if (!memberData || !memberData.permissions) {
    return; // Nothing to reset
  }

  await db.delete(tribeMemberPermission).where(eq(tribeMemberPermission.id, memberData.permissions.id));
}

/**
 * Change member role
 *
 * Updates the role for a tribe member.
 * Cannot change to/from owner role (use transfer ownership for that).
 *
 * @param tribeId - The tribe ID
 * @param userId - The user ID
 * @param newRole - The new role
 * @param changedBy - User ID making the change (unused but kept for audit trail)
 * @throws Error if member not found or attempting to change owner role
 */
export async function changeMemberRole(
  tribeId: string,
  userId: string,
  newRole: string,
  changedBy: string
): Promise<void> {
  if (newRole === "owner") {
    throw new Error("Use transfer ownership endpoint to change owner");
  }

  const [member] = await db
    .select()
    .from(tribeMember)
    .where(and(eq(tribeMember.tribeId, tribeId), eq(tribeMember.userId, userId)))
    .limit(1);

  if (!member) {
    throw new Error("Member not found");
  }

  if (member.role === "owner") {
    throw new Error("Cannot change owner role");
  }

  await db.update(tribeMember).set({ role: newRole as any }).where(eq(tribeMember.id, member.id));
}
