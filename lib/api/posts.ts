import { apiFetch, buildQueryString } from './client';
import type { PostWithStats, PostWithAuthor } from '@/lib/database/types';

const API_BASE = '/api/tribes';

// ============================================================================
// Types
// ============================================================================

export type PostSortOption = 'new' | 'hot' | 'top';
export type PostContentType = 'all' | 'text' | 'media' | 'announcements';

export interface FetchTribePostsParams {
  tribeId: string;
  limit?: number;
  offset?: number;
  sort?: PostSortOption;
  contentType?: PostContentType;
}

export interface CreatePostParams {
  tribeId: string;
  content: string;
  mediaId?: string | null;
  albumId?: string | null;
  addToAlbum: boolean;
  linkedAlbumId?: string | null;
}

export interface UpdatePostParams {
  tribeId: string;
  postId: string;
  content: string;
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Fetch posts for a tribe with optional pagination and filtering
 */
export async function fetchTribePosts(
  params: FetchTribePostsParams
): Promise<PostWithStats[]> {
  const { tribeId, ...queryParams } = params;
  // Only include non-default values in query string
  const filteredParams: Record<string, unknown> = {};
  if (queryParams.limit) filteredParams.limit = queryParams.limit;
  if (queryParams.offset) filteredParams.offset = queryParams.offset;
  if (queryParams.sort && queryParams.sort !== 'new') filteredParams.sort = queryParams.sort;
  if (queryParams.contentType && queryParams.contentType !== 'all') filteredParams.contentType = queryParams.contentType;

  const queryString = buildQueryString(filteredParams);
  return apiFetch<PostWithStats[]>(
    `${API_BASE}/${tribeId}/posts${queryString}`
  );
}

/**
 * Fetch a single post by ID
 */
export async function fetchPost(
  tribeId: string,
  postId: string
): Promise<PostWithStats> {
  return apiFetch<PostWithStats>(
    `${API_BASE}/${tribeId}/posts/${postId}`
  );
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Create a new post in a tribe
 */
export async function createPost(
  params: CreatePostParams
): Promise<PostWithAuthor> {
  const { tribeId, ...body } = params;
  return apiFetch<PostWithAuthor>(
    `${API_BASE}/${tribeId}/posts`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
}

/**
 * Update an existing post
 */
export async function updatePost(
  params: UpdatePostParams
): Promise<PostWithAuthor> {
  const { tribeId, postId, content } = params;
  return apiFetch<PostWithAuthor>(
    `${API_BASE}/${tribeId}/posts/${postId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    }
  );
}

/**
 * Delete a post
 */
export async function deletePost(
  tribeId: string,
  postId: string
): Promise<void> {
  return apiFetch<void>(
    `${API_BASE}/${tribeId}/posts/${postId}`,
    { method: 'DELETE' }
  );
}

/**
 * Toggle like status on a post
 */
export async function togglePostLike(
  tribeId: string,
  postId: string
): Promise<{ isLiked: boolean }> {
  return apiFetch<{ isLiked: boolean }>(
    `${API_BASE}/${tribeId}/posts/${postId}/like`,
    { method: 'POST' }
  );
}
