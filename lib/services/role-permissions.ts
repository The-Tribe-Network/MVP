import { db } from "@/lib/database/client";
import { tribeRolePermission } from "@/lib/database/schemas/permissions";
import { eq, and } from "drizzle-orm";

/**
 * System Role Defaults
 *
 * These are the hardcoded default permissions for each role.
 * They serve as the final fallback in the three-layer permission system.
 * Values from TRIBE_SETTINGS_PRD.md Section 6 (Permission System Architecture).
 */
export const SYSTEM_ROLE_DEFAULTS: Record<string, Record<string, boolean>> = {
  owner: {
    canPost: true,
    canComment: true,
    canEditOwnPosts: true,
    canDeleteOwnPosts: true,
    canUploadMedia: true,
    canCreateAlbums: true,
    canDeleteOwnMedia: true,
    canCreateEvents: true,
    canEditEvents: true,
    canDeleteEvents: true,
    canInviteMembers: true,
    canRemoveMembers: true,
    canChangeMemberRoles: true,
    canManagePermissions: true,
    canModeratePosts: true,
    canModerateComments: true,
    canDeleteAnyPost: true,
    canDeleteAnyComment: true,
    canDeleteAnyMedia: true,
    canEditTribeSettings: true,
    canSendMessages: true,
  },
  admin: {
    canPost: true,
    canComment: true,
    canEditOwnPosts: true,
    canDeleteOwnPosts: true,
    canUploadMedia: true,
    canCreateAlbums: true,
    canDeleteOwnMedia: true,
    canCreateEvents: true,
    canEditEvents: true,
    canDeleteEvents: true,
    canInviteMembers: true,
    canRemoveMembers: true,
    canChangeMemberRoles: true,
    canManagePermissions: true,
    canModeratePosts: true,
    canModerateComments: true,
    canDeleteAnyPost: true,
    canDeleteAnyComment: true,
    canDeleteAnyMedia: true,
    canEditTribeSettings: true,
    canSendMessages: true,
  },
  moderator: {
    canPost: true,
    canComment: true,
    canEditOwnPosts: true,
    canDeleteOwnPosts: true,
    canUploadMedia: true,
    canCreateAlbums: true,
    canDeleteOwnMedia: true,
    canCreateEvents: true,
    canEditEvents: false,
    canDeleteEvents: false,
    canInviteMembers: true,
    canRemoveMembers: false,
    canChangeMemberRoles: false,
    canManagePermissions: false,
    canModeratePosts: true,
    canModerateComments: true,
    canDeleteAnyPost: true,
    canDeleteAnyComment: true,
    canDeleteAnyMedia: false,
    canEditTribeSettings: false,
    canSendMessages: true,
  },
  member: {
    canPost: true,
    canComment: true,
    canEditOwnPosts: true,
    canDeleteOwnPosts: true,
    canUploadMedia: true,
    canCreateAlbums: false,
    canDeleteOwnMedia: true,
    canCreateEvents: false,
    canEditEvents: false,
    canDeleteEvents: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canChangeMemberRoles: false,
    canManagePermissions: false,
    canModeratePosts: false,
    canModerateComments: false,
    canDeleteAnyPost: false,
    canDeleteAnyComment: false,
    canDeleteAnyMedia: false,
    canEditTribeSettings: false,
    canSendMessages: true,
  },
};

/**
 * Get effective permissions for a specific role in a tribe
 *
 * Combines tribe-specific overrides with system defaults.
 * Returns a fully resolved permission set for the role.
 *
 * @param tribeId - The tribe ID
 * @param role - The role (owner, admin, moderator, member)
 * @returns Resolved permission set with boolean values
 */
export async function getRolePermissions(
  tribeId: string,
  role: string
): Promise<Record<string, boolean>> {
  // Fetch tribe-specific role permissions
  const [rolePerms] = await db
    .select()
    .from(tribeRolePermission)
    .where(and(eq(tribeRolePermission.tribeId, tribeId), eq(tribeRolePermission.role, role as any)))
    .limit(1);

  // Start with system defaults
  const permissions: Record<string, boolean> = { ...SYSTEM_ROLE_DEFAULTS[role] };

  // Apply tribe-specific overrides (only for non-null values)
  if (rolePerms) {
    Object.keys(permissions).forEach((key) => {
      const tribeValue = (rolePerms as any)[key];
      if (tribeValue !== null && tribeValue !== undefined) {
        permissions[key] = tribeValue === true;
      }
    });
  }

  return permissions;
}

/**
 * Get all role permissions for a tribe (all 4 roles)
 *
 * Returns an array with permission configuration for each role.
 * Used by the Roles settings tab to display the permission matrix.
 *
 * @param tribeId - The tribe ID
 * @returns Array of role permission configurations
 */
export async function getAllRolePermissions(
  tribeId: string
): Promise<
  Array<{
    role: string;
    permissions: Record<string, boolean | null>;
    isLocked: boolean;
  }>
> {
  const roles = ["owner", "admin", "moderator", "member"];
  const results = [];

  for (const role of roles) {
    const [tribeRolePerms] = await db
      .select()
      .from(tribeRolePermission)
      .where(and(eq(tribeRolePermission.tribeId, tribeId), eq(tribeRolePermission.role, role as any)))
      .limit(1);

    // Build permissions object showing tribe-specific overrides (null = use system default)
    const permissions: Record<string, boolean | null> = {};
    Object.keys(SYSTEM_ROLE_DEFAULTS[role]).forEach((key) => {
      const tribeValue = tribeRolePerms ? (tribeRolePerms as any)[key] : null;
      permissions[key] = tribeValue !== undefined ? tribeValue : null;
    });

    results.push({
      role,
      permissions,
      isLocked: role === "owner", // Owner permissions cannot be modified
    });
  }

  return results;
}

/**
 * Update role permissions for a tribe
 *
 * Updates or creates tribe-specific permission overrides for a role.
 * Owner permissions cannot be modified.
 *
 * @param tribeId - The tribe ID
 * @param role - The role to update
 * @param permissions - Permission overrides (null = use system default)
 * @param updatedBy - User ID making the change
 * @throws Error if attempting to modify owner permissions
 */
export async function updateRolePermissions(
  tribeId: string,
  role: string,
  permissions: Record<string, boolean | null>,
  updatedBy: string
): Promise<void> {
  if (role === "owner") {
    throw new Error("Owner permissions cannot be modified");
  }

  // Check if record exists
  const [existing] = await db
    .select()
    .from(tribeRolePermission)
    .where(and(eq(tribeRolePermission.tribeId, tribeId), eq(tribeRolePermission.role, role as any)))
    .limit(1);

  const updateData: any = {
    ...permissions,
    updatedBy,
    updatedAt: new Date(),
  };

  if (existing) {
    // Update existing record
    await db.update(tribeRolePermission).set(updateData).where(eq(tribeRolePermission.id, existing.id));
  } else {
    // Insert new record
    await db.insert(tribeRolePermission).values({
      tribeId,
      role: role as any,
      ...permissions,
      updatedBy,
    } as any);
  }
}

/**
 * Check a specific permission for a user
 *
 * Implements the three-layer permission resolution:
 * 1. Individual Override (tribeMemberPermission)
 * 2. Tribe Role Default (tribeRolePermission)
 * 3. System Default (SYSTEM_ROLE_DEFAULTS)
 *
 * @param tribeId - The tribe ID
 * @param userId - The user ID
 * @param permissionKey - The permission to check
 * @returns true if user has the permission, false otherwise
 */
export async function checkPermission(
  tribeId: string,
  userId: string,
  permissionKey: string
): Promise<boolean> {
  // Import here to avoid circular dependency
  const { getMemberWithPermissions } = await import("./permissions");

  // Get member with individual overrides
  const memberData = await getMemberWithPermissions(tribeId, userId);
  if (!memberData) return false;

  // Layer 1: Check individual override
  const individualValue = (memberData.permissions as any)?.[permissionKey];
  if (individualValue !== null && individualValue !== undefined) {
    return individualValue === true;
  }

  // Layer 2: Check tribe's role default
  const rolePermissions = await getRolePermissions(tribeId, memberData.member.role);
  if (rolePermissions[permissionKey] !== null && rolePermissions[permissionKey] !== undefined) {
    return rolePermissions[permissionKey] === true;
  }

  // Layer 3: Fall back to system default
  return SYSTEM_ROLE_DEFAULTS[memberData.member.role]?.[permissionKey] === true;
}
