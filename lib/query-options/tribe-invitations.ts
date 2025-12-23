import { queryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { fetchTribeInvitations } from '@/lib/api/tribes';

/**
 * Query options for fetching tribe invitations
 * Returns all invitations with inviter info
 */
export function tribeInvitationsOptions(tribeId: string) {
  return queryOptions({
    queryKey: queryKeys.tribes.invitations.tribe(tribeId),
    queryFn: () => fetchTribeInvitations(tribeId),
    staleTime: 30 * 1000, // 30 seconds (matches invitation pattern)
  });
}
