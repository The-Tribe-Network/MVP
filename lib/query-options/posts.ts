import { queryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { fetchTribePosts, fetchPost, type FetchTribePostsParams } from '@/lib/api/posts';

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching tribe posts with optional pagination
 */
export function tribePostsOptions(
  tribeId: string,
  options?: { limit?: number; offset?: number }
) {
  return queryOptions({
    queryKey: queryKeys.posts.tribe(tribeId),
    queryFn: () => fetchTribePosts({ tribeId, ...options }),
  });
}

/**
 * Query options for fetching a single post by ID
 */
export function postDetailOptions(tribeId: string, postId: string) {
  return queryOptions({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: () => fetchPost(tribeId, postId),
  });
}
