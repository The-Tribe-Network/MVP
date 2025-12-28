import { queryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { fetchTribePosts, fetchPost, type FetchTribePostsParams, type PostSortOption, type PostContentType } from '@/lib/api/posts';

// ============================================================================
// Types
// ============================================================================

export interface PostFilterOptions {
  limit?: number;
  offset?: number;
  sort?: PostSortOption;
  contentType?: PostContentType;
}

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching tribe posts with optional pagination and filtering
 */
export function tribePostsOptions(
  tribeId: string,
  options?: PostFilterOptions
) {
  // Normalize filters to prevent cache fragmentation
  const filtersObject = options
    ? Object.fromEntries(
        Object.entries({
          sort: options.sort,
          contentType: options.contentType,
        }).filter(([_, v]) => v !== undefined && v !== 'new' && v !== 'all')
      )
    : undefined;

  return queryOptions({
    queryKey: queryKeys.posts.tribe(tribeId, filtersObject && Object.keys(filtersObject).length > 0 ? filtersObject : undefined),
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
