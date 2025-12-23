import { db, getDbTransaction } from "@/lib/database/client";
import { tribeMember, tribeMemberPermission } from "@/lib/database/schemas/tribe";
import { user } from "@/lib/database/schemas/auth";
import { eq, and, like, or, count, gte, lte, sql } from "drizzle-orm";
import { getMemberWithPermissions } from "./permissions";
import { checkPermission } from "./role-permissions";
import type { PaginatedMembers, MemberListItem } from "@/lib/database/types";
import type { MemberListQuery, UpdateMemberPermissionsInput } from "@/lib/validations/members";

/**
 * Role hierarchy for permission checks
 * Higher number = higher authority
 */
const roleHierarchy = {
  owner: 4,
  admin: 3,
  moderator: 2,
  member: 1,
} as const;

/**
 * Helper function to check if requesting user can manage target member
 * Enforces role hierarchy and self-management rules
 */
async function canManageMember(
  tribeId: string,
  requestingUserId: string,
  targetMemberId: string
): Promise<{ canManage: boolean; reason?: string; requester?: any; target?: any }> {
  // Get both members with permissions in parallel
  const [requesterData, targetData] = await Promise.all([
    db
      .select({ member: tribeMember, permissions: tribeMemberPermission })
      .from(tribeMember)
      .leftJoin(tribeMemberPermission, eq(tribeMemberPermission.tribeMemberId, tribeMember.id))
      .where(eq(tribeMember.id, requestingUserId)),
    db
      .select({ member: tribeMember, permissions: tribeMemberPermission })
      .from(tribeMember)
      .leftJoin(tribeMemberPermission, eq(tribeMemberPermission.tribeMemberId, tribeMember.id))
      .where(eq(tribeMember.id, targetMemberId)),
  ]);

  const requester = requesterData[0];
  const target = targetData[0];

  if (!requester || !target) {
    return { canManage: false, reason: 'Member not found' };
  }

  // Cannot manage yourself
  if (requester.member.userId === target.member.userId) {
    return { canManage: false, reason: 'Cannot manage yourself' };
  }

  // Cannot manage owner
  if (target.member.role === 'owner') {
    return { canManage: false, reason: 'Cannot manage tribe owner' };
  }

  // Check role hierarchy
  const requesterLevel = roleHierarchy[requester.member.role];
  const targetLevel = roleHierarchy[target.member.role];

  if (requesterLevel <= targetLevel) {
    return { canManage: false, reason: 'Insufficient permissions - cannot manage members of equal or higher rank' };
  }

  return { canManage: true, requester, target };
}

/**
 * Get all tribe members with pagination and filters
 * OPTIMIZED: Single query with joins for user data and permission status
 */
export async function getAllTribeMembers(
  tribeId: string,
  userId: string,
  options: MemberListQuery
): Promise<PaginatedMembers> {
  // Verify requesting user is a member
  const requestingMember = await getMemberWithPermissions(tribeId, userId);
  if (!requestingMember) {
    throw new Error('Not a member of this tribe');
  }

  const { page = 1, pageSize = 50, search, role, hasCustomPermissions, joinedAfter, joinedBefore } = options;
  const offset = (page - 1) * pageSize;

  // Build where conditions
  const conditions = [eq(tribeMember.tribeId, tribeId)];

  // Search filter (name, username, or email)
  if (search) {
    conditions.push(
      or(
        like(user.name, `%${search}%`),
        like(user.username, `%${search}%`),
        like(user.email, `%${search}%`)
      )!
    );
  }

  // Role filter
  if (role) {
    conditions.push(eq(tribeMember.role, role));
  }

  // Date range filters
  if (joinedAfter) {
    conditions.push(gte(tribeMember.joinedAt, new Date(joinedAfter)));
  }
  if (joinedBefore) {
    conditions.push(lte(tribeMember.joinedAt, new Date(joinedBefore)));
  }

  // Base query to get members with user data and permission status
  let query = db
    .select({
      id: tribeMember.id,
      role: tribeMember.role,
      joinedAt: tribeMember.joinedAt,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        image: user.image,
      },
      hasCustomPermissions: sql<boolean>`CASE WHEN ${tribeMemberPermission.id} IS NOT NULL THEN true ELSE false END`,
      restrictionReason: tribeMemberPermission.restrictionReason,
    })
    .from(tribeMember)
    .innerJoin(user, eq(tribeMember.userId, user.id))
    .leftJoin(tribeMemberPermission, eq(tribeMemberPermission.tribeMemberId, tribeMember.id))
    .where(and(...conditions))
    .orderBy(tribeMember.joinedAt)
    .limit(pageSize)
    .offset(offset);

  // Execute query
  const members = await query;

  // Get total count for pagination
  const [totalResult] = await db
    .select({ count: count() })
    .from(tribeMember)
    .innerJoin(user, eq(tribeMember.userId, user.id))
    .where(and(...conditions));

  const total = totalResult?.count || 0;

  // Filter by hasCustomPermissions if specified (post-query filter since it's a computed field)
  let filteredMembers = members as MemberListItem[];
  if (hasCustomPermissions !== undefined) {
    filteredMembers = members.filter((m) => m.hasCustomPermissions === hasCustomPermissions);
  }

  return {
    members: filteredMembers,
    total,
    page,
    pageSize,
    hasMore: offset + pageSize < total,
  };
}

/**
 * Change a member's role
 * Requires canChangeMemberRoles permission
 * Enforces role hierarchy rules
 */
export async function changeMemberRole(
  tribeId: string,
  requestingUserId: string,
  targetMemberId: string,
  newRole: 'admin' | 'moderator' | 'member'
): Promise<void> {
  // Get requesting user's member data
  const requestingMemberData = await getMemberWithPermissions(tribeId, requestingUserId);
  if (!requestingMemberData) {
    throw new Error('Not a member of this tribe');
  }

  // Check if requesting user can change roles using new three-layer permission system
  const canChangeRoles = await checkPermission(tribeId, requestingUserId, 'canChangeMemberRoles');
  if (!canChangeRoles) {
    throw new Error('No permission to change member roles');
  }

  // Check if can manage target member (role hierarchy)
  const managementCheck = await canManageMember(tribeId, requestingMemberData.member.id, targetMemberId);
  if (!managementCheck.canManage) {
    throw new Error(managementCheck.reason || 'Cannot manage this member');
  }

  // Additional role-specific checks
  const requesterRole = requestingMemberData.member.role;
  if (requesterRole === 'admin') {
    // Admins can only assign moderator or member roles
    if (newRole === 'admin') {
      throw new Error('Only owners can assign admin role');
    }
  }

  // Update member role
  const [updatedMember] = await db
    .update(tribeMember)
    .set({ role: newRole })
    .where(eq(tribeMember.id, targetMemberId))
    .returning();

  if (!updatedMember) {
    throw new Error('Failed to update member role');
  }
}

/**
 * Remove a member from the tribe
 * Requires canRemoveMembers permission
 * Enforces role hierarchy rules
 */
export async function removeMember(
  tribeId: string,
  requestingUserId: string,
  targetMemberId: string
): Promise<void> {
  // Get requesting user's member data
  const requestingMemberData = await getMemberWithPermissions(tribeId, requestingUserId);
  if (!requestingMemberData) {
    throw new Error('Not a member of this tribe');
  }

  // Check if requesting user can remove members using new three-layer permission system
  const canRemove = await checkPermission(tribeId, requestingUserId, 'canRemoveMembers');
  if (!canRemove) {
    throw new Error('No permission to remove members');
  }

  // Check if can manage target member (role hierarchy)
  const managementCheck = await canManageMember(tribeId, requestingMemberData.member.id, targetMemberId);
  if (!managementCheck.canManage) {
    throw new Error(managementCheck.reason || 'Cannot remove this member');
  }

  // Delete member record (cascade will handle permissions)
  await db.delete(tribeMember).where(eq(tribeMember.id, targetMemberId));
}

/**
 * Update member permissions (set overrides)
 * Requires canManagePermissions permission
 * Enforces role hierarchy rules
 */
export async function updateMemberPermissions(
  tribeId: string,
  requestingUserId: string,
  targetMemberId: string,
  permissions: Omit<UpdateMemberPermissionsInput, 'memberId'>
): Promise<void> {
  // Get requesting user's member data
  const requestingMemberData = await getMemberWithPermissions(tribeId, requestingUserId);
  if (!requestingMemberData) {
    throw new Error('Not a member of this tribe');
  }

  // Check if requesting user can manage permissions using new three-layer permission system
  const canManage = await checkPermission(tribeId, requestingUserId, 'canManagePermissions');
  if (!canManage) {
    throw new Error('No permission to manage member permissions');
  }

  // Check if can manage target member (role hierarchy)
  const managementCheck = await canManageMember(tribeId, requestingMemberData.member.id, targetMemberId);
  if (!managementCheck.canManage) {
    throw new Error(managementCheck.reason || 'Cannot manage this member');
  }

  const targetMember = managementCheck.target?.member;
  if (!targetMember) {
    throw new Error('Target member not found');
  }

  // Prepare permission data (filter out undefined values)
  const { restrictionReason, ...permissionFields } = permissions;
  const permissionData: any = {
    tribeMemberId: targetMemberId,
    tribeId,
    userId: targetMember.userId,
    setBy: requestingUserId,
    restrictionReason: restrictionReason || null,
  };

  // Add only defined permission fields
  for (const [key, value] of Object.entries(permissionFields)) {
    if (value !== undefined) {
      permissionData[key] = value;
    }
  }

  // Check if permission record already exists
  const [existingPermission] = await db
    .select()
    .from(tribeMemberPermission)
    .where(eq(tribeMemberPermission.tribeMemberId, targetMemberId))
    .limit(1);

  if (existingPermission) {
    // Update existing permission record
    await db
      .update(tribeMemberPermission)
      .set(permissionData)
      .where(eq(tribeMemberPermission.tribeMemberId, targetMemberId));
  } else {
    // Insert new permission record
    await db.insert(tribeMemberPermission).values(permissionData);
  }
}

/**
 * Clear all permission overrides for a member (revert to role defaults)
 * Requires canManagePermissions permission
 * Enforces role hierarchy rules
 */
export async function clearMemberPermissions(
  tribeId: string,
  requestingUserId: string,
  targetMemberId: string
): Promise<void> {
  // Get requesting user's member data
  const requestingMemberData = await getMemberWithPermissions(tribeId, requestingUserId);
  if (!requestingMemberData) {
    throw new Error('Not a member of this tribe');
  }

  // Check if requesting user can manage permissions using new three-layer permission system
  const canManage = await checkPermission(tribeId, requestingUserId, 'canManagePermissions');
  if (!canManage) {
    throw new Error('No permission to manage member permissions');
  }

  // Check if can manage target member (role hierarchy)
  const managementCheck = await canManageMember(tribeId, requestingMemberData.member.id, targetMemberId);
  if (!managementCheck.canManage) {
    throw new Error(managementCheck.reason || 'Cannot manage this member');
  }

  // Delete permission overrides
  await db
    .delete(tribeMemberPermission)
    .where(eq(tribeMemberPermission.tribeMemberId, targetMemberId));
}
