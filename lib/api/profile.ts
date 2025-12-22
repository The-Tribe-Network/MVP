import { apiFetch } from './client';
import type { User } from '@/lib/database/types';

const API_BASE = '/api/user/profile';

// ============================================================================
// Types
// ============================================================================

export interface UpdateProfileParams {
  name?: string;
  email?: string;
  image?: string;
  bio?: string;
  username?: string;
}

export interface CheckUsernameResponse {
  available: boolean;
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Fetch the current user's profile
 */
export async function fetchProfile(): Promise<any> {
  return apiFetch<any>(API_BASE);
}

/**
 * Check if a username is available
 */
export async function checkUsername(username: string): Promise<CheckUsernameResponse> {
  return apiFetch<CheckUsernameResponse>(
    `/api/user/username/check?username=${encodeURIComponent(username)}`
  );
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Update the current user's profile
 */
export async function updateProfile(
  params: UpdateProfileParams
): Promise<any> {
  return apiFetch<any>(
    API_BASE,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }
  );
}

/**
 * Complete profile setup (combines update + mark complete)
 */
export async function completeProfile(
  params: UpdateProfileParams
): Promise<any> {
  // First update profile
  const updateResponse = await apiFetch<any>(
    API_BASE,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }
  );

  // Then mark as complete
  const completeResponse = await apiFetch<any>(
    `${API_BASE}/complete`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }
  );

  return completeResponse;
}

/**
 * Delete the current user's account
 */
export async function deleteAccount(): Promise<void> {
  return apiFetch<void>(
    API_BASE,
    { method: 'DELETE' }
  );
}

/**
 * Fetch tour completion status
 */
export async function fetchTourStatus(): Promise<{ tourCompleted: boolean }> {
  return apiFetch<{ tourCompleted: boolean }>('/api/user/tour');
}

/**
 * Mark tour as completed
 */
export async function completeTour(): Promise<User> {
  return apiFetch<User>(
    '/api/user/tour',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
