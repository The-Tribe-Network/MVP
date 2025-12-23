import { queryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { fetchTribeMembers } from '@/lib/api/members';
import type { MemberListQuery } from '@/lib/validations/members';

/**
 * Query options for fetching tribe members list with pagination and filters
 */
export function tribeMembersListOptions(
  tribeId: string,
  query?: MemberListQuery
) {
  // Normalize filters to prevent cache fragmentation
  const normalizedFilters = query
    ? Object.fromEntries(
        Object.entries(query).filter(([_, v]) => v !== undefined)
      )
    : undefined;

  return queryOptions({
    queryKey: queryKeys.tribes.members.list(tribeId, normalizedFilters),
    queryFn: () => fetchTribeMembers(tribeId, query),
    staleTime: 1000 * 60, // 1 minute
  });
}
