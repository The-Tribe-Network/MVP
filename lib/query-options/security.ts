import { queryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { fetchSessions } from '@/lib/api/security';

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching active sessions
 */
export function sessionsOptions() {
  return queryOptions({
    queryKey: queryKeys.security.sessions(),
    queryFn: fetchSessions,
  });
}
