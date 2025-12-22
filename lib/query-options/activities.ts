import { queryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import {
  fetchTribeActivities,
  fetchRecentActivities,
  type FetchTribeActivitiesParams,
  type FetchRecentActivitiesParams,
} from '@/lib/api/activities';

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching tribe activities
 */
export function tribeActivitiesOptions(
  tribeId: string,
  options?: { limit?: number; offset?: number }
) {
  return queryOptions({
    queryKey: queryKeys.activities.tribe(tribeId),
    queryFn: () => fetchTribeActivities({ tribeId, ...options }),
  });
}

/**
 * Query options for fetching recent activities across all tribes
 */
export function recentActivitiesOptions(
  options?: FetchRecentActivitiesParams
) {
  return queryOptions({
    queryKey: ['activities', 'recent'],
    queryFn: () => fetchRecentActivities(options),
  });
}

/**
 * Query options for fetching user activities (alias for recentActivitiesOptions)
 * Uses queryKeys.activities.users() for consistency
 */
export function userActivitiesOptions(
  options?: FetchRecentActivitiesParams
) {
  return queryOptions({
    queryKey: queryKeys.activities.users(),
    queryFn: () => fetchRecentActivities(options),
  });
}
