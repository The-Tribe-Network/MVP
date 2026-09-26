import { db } from "@/lib/database/client";
import { tribeRolePermission } from "@/lib/database/schemas/permissions";
import { eq, and } from "drizzle-orm";
import { getTribeSettings } from "./tribe-settings";
import type { TribeSettings } from "@/lib/database/types";

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
    canCreateTimelines: true,
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
    canCreateTimelines: true,
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
    canCreateTimelines: false,
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
    canCreateTimelines: false,
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

// ============================================
// Tribe permission levels (tribe_settings.*PermissionLevel)
// ============================================

/**
 * The permissions a tribe-level "who can …" setting also gates. A member has one of these only when the
 * permission resolves true (override → tribe role default → system default) AND their role meets the
 * tribe's level for it. The owner always meets the level.
 *
 * Event editing and poll creation are per event (`event_settings.editPermission` / `pollCreationLevel`,
 * seeded from the tribe's `eventEditPermissionLevel` / `pollCreationPermissionLevel`), so they are
 * checked where the event is known, not here.
 */
export const PERMISSION_LEVEL_SETTINGS = {
  canPost: "postingPermissionLevel",
  canComment: "commentingPermissionLevel",
  canUploadMedia: "mediaUploadPermissionLevel",
  canCreateAlbums: "albumCreationPermissionLevel",
  canCreateEvents: "eventCreationPermissionLevel",
} as const satisfies Record<string, keyof TribeSettings>;

type LevelGatedPermission = keyof typeof PERMISSION_LEVEL_SETTINGS;

/**
 * The permissions a tribe-level on/off switch also gates (Timeline settings). While the switch is off,
 * nobody but the owner has the permission. These are the author's own-post rights only: moderators and
 * admins still edit or delete others' posts through `canModeratePosts` / `canDeleteAnyPost`.
 */
export const PERMISSION_SWITCH_SETTINGS = {
  canEditOwnPosts: "allowPostEditing",
  canDeleteOwnPosts: "allowPostDeletion",
} as const satisfies Record<string, keyof TribeSettings>;

type SwitchGatedPermission = keyof typeof PERMISSION_SWITCH_SETTINGS;
export type PermissionLevels = Pick<
  TribeSettings,
  | (typeof PERMISSION_LEVEL_SETTINGS)[LevelGatedPermission]
  | (typeof PERMISSION_SWITCH_SETTINGS)[SwitchGatedPermission]
>;

const ROLE_RANK: Record<string, number> = { member: 0, moderator: 1, admin: 2, owner: 3 };

/** Minimum role rank for each level value (`permission_level` and `poll_creation_permission` enums). */
const LEVEL_RANK: Record<string, number> = {
  all_members: 0,
  moderators: 1,
  admins: 2,
  owner_only: 3,
};

/**
 * Whether `role` meets a tribe level: all_members < moderators < admins < owner_only. The owner always
 * does. An unknown level (e.g. `event_creator`, which is about the event, not the role) is met by the
 * owner only.
 */
export function roleMeetsLevel(role: string, level: string): boolean {
  if (role === "owner") return true;
  const needed = LEVEL_RANK[level];
  if (needed === undefined) return false;
  return (ROLE_RANK[role] ?? -1) >= needed;
}

/** The tribe's level settings and switches for the level- and switch-gated permissions. */
export async function getPermissionLevels(tribeId: string): Promise<PermissionLevels> {
  const settings = await getTribeSettings(tribeId);
  return {
    postingPermissionLevel: settings.postingPermissionLevel,
    commentingPermissionLevel: settings.commentingPermissionLevel,
    mediaUploadPermissionLevel: settings.mediaUploadPermissionLevel,
    albumCreationPermissionLevel: settings.albumCreationPermissionLevel,
    eventCreationPermissionLevel: settings.eventCreationPermissionLevel,
    allowPostEditing: settings.allowPostEditing,
    allowPostDeletion: settings.allowPostDeletion,
  };
}

/**
 * Turn off each level-gated permission whose tribe level the role does not meet, and each switch-gated
 * permission whose tribe switch is off (the owner excepted). Mutates and returns `permissions`; a
 * permission that already resolved false stays false.
 */
export function applyPermissionLevels(
  permissions: Record<string, boolean>,
  role: string,
  levels: PermissionLevels
): Record<string, boolean> {
  for (const [key, setting] of Object.entries(PERMISSION_LEVEL_SETTINGS)) {
    if (permissions[key] === true && !roleMeetsLevel(role, levels[setting])) {
      permissions[key] = false;
    }
  }
  if (role !== "owner") {
    for (const [key, setting] of Object.entries(PERMISSION_SWITCH_SETTINGS)) {
      if (permissions[key] === true && !levels[setting]) permissions[key] = false;
    }
  }
  return permissions;
}

/**
 * Check a specific permission for a user
 *
 * Implements the three-layer permission resolution:
 * 1. Individual Override (tribeMemberPermission)
 * 2. Tribe Role Default (tribeRolePermission)
 * 3. System Default (SYSTEM_ROLE_DEFAULTS)
 * then, for the level-gated permissions (`PERMISSION_LEVEL_SETTINGS`), the tribe's level setting, and for
 * the switch-gated ones (`PERMISSION_SWITCH_SETTINGS`), the tribe's switch (the owner is exempt).
 * Same result as the key in `resolveEffectivePermissions` (`GET /members/me`).
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

  const role = memberData.member.role;
  let allowed: boolean | undefined;

  // Layer 1: Check individual override
  const individualValue = (memberData.permissions as any)?.[permissionKey];
  if (individualValue !== null && individualValue !== undefined) {
    allowed = individualValue === true;
  }

  // Layer 2: Check tribe's role default
  if (allowed === undefined) {
    const rolePermissions = await getRolePermissions(tribeId, role);
    if (rolePermissions[permissionKey] !== null && rolePermissions[permissionKey] !== undefined) {
      allowed = rolePermissions[permissionKey] === true;
    }
  }

  // Layer 3: Fall back to system default
  if (allowed === undefined) {
    allowed = SYSTEM_ROLE_DEFAULTS[role]?.[permissionKey] === true;
  }

  // Tribe level gate
  if (allowed && permissionKey in PERMISSION_LEVEL_SETTINGS) {
    const levels = await getPermissionLevels(tribeId);
    const setting = PERMISSION_LEVEL_SETTINGS[permissionKey as LevelGatedPermission];
    return roleMeetsLevel(role, levels[setting]);
  }

  // Tribe switch gate
  if (allowed && role !== "owner" && permissionKey in PERMISSION_SWITCH_SETTINGS) {
    const levels = await getPermissionLevels(tribeId);
    return levels[PERMISSION_SWITCH_SETTINGS[permissionKey as SwitchGatedPermission]];
  }

  return allowed;
}
