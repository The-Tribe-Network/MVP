import { apiFetch } from './client';
import type { User } from '@/lib/database/types';

const API_BASE = '/api/profile';

// ============================================================================
// Types
// ============================================================================

export interface UpdateProfileParams {
  name?: string;
  email?: string;
  image?: string;
  bio?: string;
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Fetch the current user's profile
 */
export async function fetchProfile(): Promise<User> {
  return apiFetch<User>(API_BASE);
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Update the current user's profile
 */
export async function updateProfile(
  params: UpdateProfileParams
): Promise<User> {
  return apiFetch<User>(
    API_BASE,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }
  );
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
