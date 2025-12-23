import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import {
  fetchRolePermissions,
  fetchMembersWithPermissions,
  fetchMemberPermissionsDetail,
} from "@/lib/api/permissions";

/**
 * Query options for fetching all role permissions for a tribe
 *
 * Returns permission configuration for all 4 roles.
 * Used by the Roles settings tab.
 *
 * @param tribeId - The tribe ID
 */
export function rolePermissionsOptions(tribeId: string) {
  return queryOptions({
    queryKey: queryKeys.tribes.roles(tribeId),
    queryFn: () => fetchRolePermissions(tribeId),
    staleTime: 1000 * 60 * 5, // 5 minutes - permissions change infrequently
  });
}

/**
 * Query options for fetching members with custom permission overrides
 *
 * Returns only members who have individual permission overrides.
 * Supports optional search and role filtering.
 *
 * @param tribeId - The tribe ID
 * @param filters - Optional search and role filters
 */
export function membersWithPermissionsOptions(
  tribeId: string,
  filters?: { search?: string; role?: string }
) {
  // Normalize filters to prevent cache fragmentation
  const filtersObject = filters
    ? Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== undefined))
    : undefined;

  return queryOptions({
    queryKey: queryKeys.permissions.members(tribeId, filtersObject),
    queryFn: () => fetchMembersWithPermissions(tribeId, filters),
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Query options for fetching detailed permission info for a specific member
 *
 * Returns individual overrides, role defaults, and effective permissions.
 * Used by the permissions drawer/edit form.
 *
 * @param tribeId - The tribe ID
 * @param userId - The user ID
 */
export function memberPermissionsDetailOptions(tribeId: string, userId: string) {
  return queryOptions({
    queryKey: queryKeys.permissions.memberDetail(tribeId, userId),
    queryFn: () => fetchMemberPermissionsDetail(tribeId, userId),
    staleTime: 1000 * 60, // 1 minute
  });
}
