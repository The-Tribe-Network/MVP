import { queryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { fetchPostComments, fetchEventComments } from '@/lib/api/comments';

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching post comments
 */
export function postCommentsOptions(tribeId: string, postId: string) {
  return queryOptions({
    queryKey: queryKeys.comments.post(postId),
    queryFn: () => fetchPostComments(tribeId, postId),
  });
}

/**
 * Query options for fetching event comments
 */
export function eventCommentsOptions(tribeId: string, eventId: string) {
  return queryOptions({
    queryKey: queryKeys.comments.event(eventId),
    queryFn: () => fetchEventComments(tribeId, eventId),
  });
}
