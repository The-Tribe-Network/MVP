import { apiFetch, buildQueryString } from './client';

const API_BASE = '/api/activities';

// ============================================================================
// Types
// ============================================================================

export interface Activity {
  id: string;
  type: string;
  userId: string;
  tribeId: string;
  postId?: string | null;
  metadata?: Record<string, any>;
  createdAt: Date;
  // Extended fields
  userName: string;
  userAvatar: string | null;
}

export interface FetchTribeActivitiesParams {
  tribeId: string;
  limit?: number;
  offset?: number;
}

export interface FetchRecentActivitiesParams {
  limit?: number;
  offset?: number;
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Fetch activities for a specific tribe
 */
export async function fetchTribeActivities(
  params: FetchTribeActivitiesParams
): Promise<Activity[]> {
  const { tribeId, ...queryParams } = params;
  const queryString = buildQueryString(queryParams);
  return apiFetch<Activity[]>(
    `/api/tribes/${tribeId}/activities${queryString}`
  );
}

/**
 * Fetch recent activities across all user's tribes
 */
export async function fetchRecentActivities(
  params?: FetchRecentActivitiesParams
): Promise<Activity[]> {
  const queryString = params ? buildQueryString(params) : '';
  return apiFetch<Activity[]>(`${API_BASE}${queryString}`);
}
