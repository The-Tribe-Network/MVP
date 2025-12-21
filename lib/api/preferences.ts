import { apiFetch } from './client';

// ============================================================================
// Types
// ============================================================================

export interface TribeMemberPreferences {
  autoAddPostMediaToTribe: boolean;
}

export interface PreferencesResponse {
  preferences: TribeMemberPreferences;
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Fetch tribe member preferences
 */
export async function fetchTribeMemberPreferences(
  tribeId: string
): Promise<TribeMemberPreferences> {
  const response = await fetch(`/api/tribes/${tribeId}/members/preferences`);

  // Return default if not found
  if (response.status === 404) {
    return { autoAddPostMediaToTribe: true };
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch preferences');
  }

  const data: PreferencesResponse = await response.json();
  return data.preferences;
}
