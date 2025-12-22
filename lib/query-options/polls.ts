import { queryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { fetchEventPolls } from '@/lib/api/polls';

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching event polls
 */
export function eventPollsOptions(tribeId: string, eventId: string) {
  return queryOptions({
    queryKey: queryKeys.polls.event(eventId),
    queryFn: () => fetchEventPolls(tribeId, eventId),
  });
}
