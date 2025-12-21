import { apiFetch } from './client';

const API_BASE = '/api/security';

// ============================================================================
// Types
// ============================================================================

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessions: ActiveSession[];
}

export interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActive: Date;
  current: boolean;
}

export interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Fetch security settings for the current user
 */
export async function fetchSecuritySettings(): Promise<SecuritySettings> {
  return apiFetch<SecuritySettings>(API_BASE);
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
 * Revoke a session
 */
export async function revokeSession(
  sessionId: string
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(
    `${API_BASE}/sessions/${sessionId}`,
    { method: 'DELETE' }
  );
}
