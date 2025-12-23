"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import {
  rolePermissionsOptions,
  membersWithPermissionsOptions,
  memberPermissionsDetailOptions,
} from "@/lib/query-options/permissions";
import {
  updateRolePermissions,
  updateMemberPermissions,
  resetMemberPermissions,
  changeMemberRole,
} from "@/lib/api/permissions";
import type {
  UpdateRolePermissionsInput,
  UpdateMemberPermissionsInput,
  ChangeMemberRoleInput,
} from "@/lib/validations/permissions";

// ============================================================================
// Queries
// ============================================================================

/**
 * Fetch all role permissions for a tribe
 *
 * Returns permission configuration for all 4 roles (owner, admin, moderator, member).
 * Used by the Roles settings tab.
 *
 * @param tribeId - The tribe ID
 */
export function useRolePermissions(tribeId: string) {
  return useQuery(rolePermissionsOptions(tribeId));
}

/**
 * Fetch members with custom permission overrides
 *
 * Returns only members who have individual permission overrides.
 * Used by the Permissions settings tab.
 *
 * @param tribeId - The tribe ID
 * @param filters - Optional search and role filters
 */
export function useMembersWithPermissions(
  tribeId: string,
  filters?: { search?: string; role?: string }
) {
  return useQuery(membersWithPermissionsOptions(tribeId, filters));
}

/**
 * Fetch detailed permission info for a specific member
 *
 * Returns individual overrides, role defaults, and effective permissions.
 * Used by the permissions drawer/edit form.
 *
 * @param tribeId - The tribe ID
 * @param userId - The user ID
 */
export function useMemberPermissionsDetail(tribeId: string, userId: string) {
  return useQuery(memberPermissionsDetailOptions(tribeId, userId));
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Update role permissions for a specific role
 *
 * Updates tribe-specific permission defaults for a role.
 * Owner permissions cannot be modified.
 *
 * @param tribeId - The tribe ID
 * @param role - The role to update (admin, moderator, member)
 */
export function useUpdateRolePermissions(tribeId: string, role: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateRolePermissionsInput) => updateRolePermissions(tribeId, role, data),
    onSuccess: () => {
      // Invalidate role permissions
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.roles(tribeId),
      });
      // Also invalidate member permissions (effective permissions may change)
      queryClient.invalidateQueries({
        queryKey: queryKeys.permissions.members(tribeId),
      });
    },
  });
}

/**
 * Update member permission overrides
 *
 * Updates or creates individual permission overrides for a member.
 * Null values mean "use role default".
 *
 * @param tribeId - The tribe ID
 * @param userId - The user ID
 */
export function useUpdateMemberPermissions(tribeId: string, userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateMemberPermissionsInput) =>
      updateMemberPermissions(tribeId, userId, data),
    onSuccess: () => {
      // Invalidate member detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.permissions.memberDetail(tribeId, userId),
      });
      // Invalidate members list
      queryClient.invalidateQueries({
        queryKey: queryKeys.permissions.members(tribeId),
      });
    },
  });
}

/**
 * Reset member permissions to role defaults
 *
 * Deletes all individual permission overrides for a member.
 *
 * @param tribeId - The tribe ID
 * @param userId - The user ID
 */
export function useResetMemberPermissions(tribeId: string, userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resetMemberPermissions(tribeId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.permissions.memberDetail(tribeId, userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.permissions.members(tribeId),
      });
    },
  });
}

/**
 * Change member role
 *
 * Updates the role for a tribe member.
 * Cannot change to/from owner role.
 *
 * @param tribeId - The tribe ID
 * @param userId - The user ID
 */
export function useChangeMemberRole(tribeId: string, userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChangeMemberRoleInput) => changeMemberRole(tribeId, userId, data),
    onSuccess: () => {
      // Invalidate member data
      queryClient.invalidateQueries({
        queryKey: queryKeys.permissions.memberDetail(tribeId, userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.permissions.members(tribeId),
      });
      // Also invalidate tribe members
      queryClient.invalidateQueries({
        queryKey: queryKeys.tribes.members.all(tribeId),
      });
    },
  });
}
