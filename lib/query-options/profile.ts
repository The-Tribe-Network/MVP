import { queryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { fetchProfile } from '@/lib/api/profile';

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
