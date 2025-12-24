import { queryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import {
  fetchUserTribes,
  fetchTribeById,
  fetchUserInvitations,
  fetchMemberWithPermissions,
} from '@/lib/api/tribes';

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching user's tribes
 */
export function userTribesOptions() {
  return queryOptions({
    queryKey: queryKeys.tribes.lists(),
    queryFn: fetchUserTribes,
  });
}

/**
 * Query options for fetching a single tribe by ID
 * Note: enabled condition should be added at hook level
 */
export function tribeDetailOptions(id: string | null | undefined) {
  return queryOptions({
    queryKey: queryKeys.tribes.tribe(id),
    queryFn: () => {
      if (!id) {
        throw new Error('Tribe ID is required');
      }
      return fetchTribeById(id);
    },
    enabled: !!id,
  });
}

/**
 * Query options for fetching user invitations
 */
export function userInvitationsOptions() {
  return queryOptions({
    queryKey: ['invitations', 'user'],
    queryFn: fetchUserInvitations,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Query options for fetching current user's member data with permissions for a tribe
 */
export function memberWithPermissionsOptions(tribeId: string) {
  return queryOptions({
    queryKey: queryKeys.tribes.members.me(tribeId),
    queryFn: () => fetchMemberWithPermissions(tribeId),
  });
}
