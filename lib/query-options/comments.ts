import { queryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { fetchPostComments } from '@/lib/api/comments';

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
