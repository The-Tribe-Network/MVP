import { queryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { fetchProfile, fetchTourStatus } from '@/lib/api/profile';

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching the current user's profile
 */
export function profileOptions() {
  return queryOptions({
    queryKey: queryKeys.profile.current(),
    queryFn: fetchProfile,
  });
}

/**
 * Query options for fetching tour completion status
 */
export function tourStatusOptions() {
  return queryOptions({
    queryKey: queryKeys.user.tour(),
    queryFn: fetchTourStatus,
  });
}
