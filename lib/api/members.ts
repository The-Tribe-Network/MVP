import { apiFetch } from './client';
import type { PaginatedMembers } from '@/lib/database/types';
import type { MemberListQuery, UpdateMemberPermissionsInput } from '@/lib/validations/members';

const API_BASE = '/api/tribes';

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Fetch members list with pagination and filters
 */
export async function fetchTribeMembers(
  tribeId: string,
  query?: MemberListQuery
): Promise<PaginatedMembers> {
  const params = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.set(key, String(value));
      }
    });
  }

  const queryString = params.toString();
  const url = `${API_BASE}/${tribeId}/members/list${queryString ? `?${queryString}` : ''}`;

  return apiFetch<PaginatedMembers>(url);
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Change member role
 */
export async function changeMemberRole(
  tribeId: string,
  memberId: string,
  newRole: 'admin' | 'moderator' | 'member'
): Promise<{ success: boolean }> {
  return apiFetch(`${API_BASE}/${tribeId}/members/${memberId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId, newRole }),
  });
}

/**
 * Remove member from tribe
 */
export async function removeTribeMember(
  tribeId: string,
  memberId: string
): Promise<{ success: boolean }> {
  return apiFetch(`${API_BASE}/${tribeId}/members/${memberId}`, {
    method: 'DELETE',
  });
}

/**
 * Update member permissions (set overrides)
 */
export async function updateMemberPermissions(
  tribeId: string,
  memberId: string,
  permissions: Partial<Omit<UpdateMemberPermissionsInput, 'memberId'>>
): Promise<{ success: boolean }> {
  return apiFetch(`${API_BASE}/${tribeId}/members/${memberId}/permissions`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId, ...permissions }),
  });
}

/**
 * Clear member permissions (revert to role defaults)
 */
export async function clearMemberPermissions(
  tribeId: string,
  memberId: string
): Promise<{ success: boolean }> {
  return apiFetch(`${API_BASE}/${tribeId}/members/${memberId}/permissions`, {
    method: 'DELETE',
  });
}
