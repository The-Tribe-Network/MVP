import { queryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { getSession, getAuthUser } from '@/lib/api/auth';

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching the current session
 * Includes advanced options for session management
 */
export function authSessionOptions() {
  return queryOptions({
    queryKey: queryKeys.auth.session(),
    queryFn: getSession,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    refetchOnWindowFocus: true,
    retry: (failureCount: number, error: Error) => {
      // Don't retry on auth errors
      if (error.message.includes('Unauthorized') || error.message.includes('Not authenticated')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Query options for fetching the authenticated user
 */
export function authUserOptions() {
  return queryOptions({
    queryKey: queryKeys.auth.user(),
    queryFn: getAuthUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount: number, error: Error) => {
      if (error.message.includes('Unauthorized') || error.message.includes('Not authenticated')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
