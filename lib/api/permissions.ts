import { apiFetch } from "./client";
import type {
  RolePermissionMatrix,
  TribeMemberWithPermissionsExtended,
  MemberPermissionDetail,
} from "@/lib/database/types";
import type {
  UpdateRolePermissionsInput,
  UpdateMemberPermissionsInput,
  ChangeMemberRoleInput,
} from "@/lib/validations/permissions";

const API_BASE = "/api/tribes";

// ============================================================================
// Role Permissions
// ============================================================================

/**
 * Fetch all role permissions for a tribe
 *
 * Returns permission configuration for all 4 roles (owner, admin, moderator, member).
 *
 * @param tribeId - The tribe ID
 * @returns Array of role permission configurations
 */
export async function fetchRolePermissions(tribeId: string): Promise<RolePermissionMatrix[]> {
  return apiFetch<RolePermissionMatrix[]>(`${API_BASE}/${tribeId}/roles`);
}

/**
 * Update role permissions for a specific role
 *
 * Updates tribe-specific permission defaults for a role.
 * Owner permissions cannot be modified.
 *
 * @param tribeId - The tribe ID
 * @param role - The role to update (admin, moderator, member)
 * @param data - Permission overrides
 * @returns Success response
 */
export async function updateRolePermissions(
  tribeId: string,
  role: string,
  data: UpdateRolePermissionsInput
): Promise<{ success: boolean }> {
  return apiFetch(`${API_BASE}/${tribeId}/roles/${role}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ============================================================================
// Member Permissions
// ============================================================================

/**
 * Fetch tribe members with custom permission overrides
 *
 * Returns only members who have individual permission overrides.
 * Supports optional search and role filtering.
 *
 * @param tribeId - The tribe ID
 * @param filters - Optional search and role filters
 * @returns Array of members with permission overrides
 */
export async function fetchMembersWithPermissions(
  tribeId: string,
  filters?: { search?: string; role?: string }
): Promise<TribeMemberWithPermissionsExtended[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.role) params.set("role", filters.role);

  const url = `${API_BASE}/${tribeId}/members/permissions${
    params.toString() ? "?" + params.toString() : ""
  }`;
  return apiFetch<TribeMemberWithPermissionsExtended[]>(url);
}

/**
 * Fetch detailed permission information for a specific member
 *
 * Returns individual overrides, role defaults, and effective permissions.
 *
 * @param tribeId - The tribe ID
 * @param userId - The user ID
 * @returns Detailed member permission info
 */
export async function fetchMemberPermissionsDetail(
  tribeId: string,
  userId: string
): Promise<MemberPermissionDetail> {
  return apiFetch<MemberPermissionDetail>(
    `${API_BASE}/${tribeId}/members/${userId}/permissions`
  );
}

/**
 * Update member permission overrides
 *
 * Updates or creates individual permission overrides for a member.
 * Null values mean "use role default".
 *
 * @param tribeId - The tribe ID
 * @param userId - The user ID
 * @param data - Permission overrides and optional restriction reason
 * @returns Success response
 */
export async function updateMemberPermissions(
  tribeId: string,
  userId: string,
  data: UpdateMemberPermissionsInput
): Promise<{ success: boolean }> {
  return apiFetch(`${API_BASE}/${tribeId}/members/${userId}/permissions`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Reset member permissions to role defaults
 *
 * Deletes all individual permission overrides for a member.
 *
 * @param tribeId - The tribe ID
 * @param userId - The user ID
 * @returns Success response
 */
export async function resetMemberPermissions(
  tribeId: string,
  userId: string
): Promise<{ success: boolean }> {
  return apiFetch(`${API_BASE}/${tribeId}/members/${userId}/permissions`, {
    method: "DELETE",
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
 * @param data - New role
 * @returns Success response
 */
export async function changeMemberRole(
  tribeId: string,
  userId: string,
  data: ChangeMemberRoleInput
): Promise<{ success: boolean }> {
  return apiFetch(`${API_BASE}/${tribeId}/members/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
