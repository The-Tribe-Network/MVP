import { apiFetch } from './client';
import type { CommentWithAuthor } from '@/lib/database/types';

const API_BASE = '/api/tribes';

// ============================================================================
// Types
// ============================================================================

export type CommentWithStats = CommentWithAuthor & {
  likeCount: number;
  isLiked: boolean;
};

export interface CreateCommentParams {
  tribeId: string;
  postId: string;
  content: string;
  parentCommentId?: string;
}

export interface CreateEventCommentParams {
  tribeId: string;
  eventId: string;
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentParams {
  tribeId: string;
  postId: string;
  commentId: string;
  content: string;
}

export interface UpdateEventCommentParams {
  tribeId: string;
  eventId: string;
  commentId: string;
  content: string;
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Fetch comments for a post
 */
export async function fetchPostComments(
  tribeId: string,
  postId: string
): Promise<CommentWithStats[]> {
  return apiFetch<CommentWithStats[]>(
    `${API_BASE}/${tribeId}/posts/${postId}/comments`
  );
}

/**
 * Fetch comments for an event
 */
export async function fetchEventComments(
  tribeId: string,
  eventId: string
): Promise<CommentWithStats[]> {
  return apiFetch<CommentWithStats[]>(
    `${API_BASE}/${tribeId}/events/${eventId}/comments`
  );
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Create a new comment on a post
 */
export async function createComment(
  params: CreateCommentParams
): Promise<CommentWithAuthor> {
  const { tribeId, postId, content, parentCommentId } = params;
  return apiFetch<CommentWithAuthor>(
    `${API_BASE}/${tribeId}/posts/${postId}/comments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, parentCommentId }),
    }
  );
}

/**
 * Update a comment
 */
export async function updateComment(
  params: UpdateCommentParams
): Promise<CommentWithAuthor> {
  const { tribeId, postId, commentId, content } = params;
  return apiFetch<CommentWithAuthor>(
    `${API_BASE}/${tribeId}/posts/${postId}/comments/${commentId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    }
  );
}

/**
 * Delete a comment
 */
export async function deleteComment(
  tribeId: string,
  postId: string,
  commentId: string
): Promise<void> {
  return apiFetch<void>(
    `${API_BASE}/${tribeId}/posts/${postId}/comments/${commentId}`,
    { method: 'DELETE' }
  );
}

/**
 * Create a new comment on an event
 */
export async function createEventComment(
  params: CreateEventCommentParams
): Promise<CommentWithAuthor> {
  const { tribeId, eventId, content, parentCommentId } = params;
  return apiFetch<CommentWithAuthor>(
    `${API_BASE}/${tribeId}/events/${eventId}/comments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, parentCommentId }),
    }
  );
}

/**
 * Update an event comment
 */
export async function updateEventComment(
  params: UpdateEventCommentParams
): Promise<CommentWithAuthor> {
  const { tribeId, eventId, commentId, content } = params;
  return apiFetch<CommentWithAuthor>(
    `${API_BASE}/${tribeId}/events/${eventId}/comments/${commentId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    }
  );
}

/**
 * Delete an event comment
 */
export async function deleteEventComment(
  tribeId: string,
  eventId: string,
  commentId: string
): Promise<void> {
  return apiFetch<void>(
    `${API_BASE}/${tribeId}/events/${eventId}/comments/${commentId}`,
    { method: 'DELETE' }
  );
}

/**
 * Toggle like status on a comment
 */
export async function toggleCommentLike(
  tribeId: string,
  postId: string,
  commentId: string
): Promise<{ isLiked: boolean }> {
  return apiFetch<{ isLiked: boolean }>(
    `${API_BASE}/${tribeId}/posts/${postId}/comments/${commentId}/like`,
    { method: 'POST' }
  );
}

/**
 * Toggle like status on an event comment
 */
export async function toggleEventCommentLike(
  tribeId: string,
  eventId: string,
  commentId: string
): Promise<{ isLiked: boolean }> {
  return apiFetch<{ isLiked: boolean }>(
    `${API_BASE}/${tribeId}/events/${eventId}/comments/${commentId}/like`,
    { method: 'POST' }
  );
}
