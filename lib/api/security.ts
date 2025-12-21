import { apiFetch } from './client';
import type { SessionWithDevice } from '@/lib/database/types';

const API_BASE = '/api/user/security';

// ============================================================================
// Types
// ============================================================================

export interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
}

export interface RevokeSessionParams {
  sessionToken: string;
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Fetch all active sessions for the current user
 */
export async function fetchSessions(): Promise<SessionWithDevice[]> {
  return apiFetch<SessionWithDevice[]>(`${API_BASE}/sessions`);
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Change the user's password
 */
export async function changePassword(
  params: ChangePasswordParams
): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(
    `${API_BASE}/password`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }
  );
}

/**
 * Revoke a specific session
 */
export async function revokeSession(
  sessionToken: string
): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(
    `${API_BASE}/sessions`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionToken }),
    }
  );
}

/**
 * Revoke all other sessions except the current one
 */
export async function revokeOtherSessions(): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(
    `${API_BASE}/sessions`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }
  );
}
