"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import { postCommentsOptions } from "@/lib/query-options/comments";
import {
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
  type CommentWithStats,
  type CreateCommentParams,
  type UpdateCommentParams,
} from "@/lib/api/comments";

// Re-export types for backwards compatibility
export type { CommentWithStats };

/**
 * Fetch comments for a post
 */
export function usePostComments(tribeId: string, postId: string) {
  return useQuery(postCommentsOptions(tribeId, postId));
}

/**
 * Create a new comment
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateCommentParams) => createComment(params),
    onSuccess: (_, variables) => {
      // Invalidate comments query
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.post(variables.postId),
      });
      // Invalidate post detail query to update comment count
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(variables.postId),
      });
    },
  });
}

/**
 * Update a comment
 */
export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateCommentParams) => updateComment(params),
    onSuccess: (_, variables) => {
      // Invalidate comments query
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.post(variables.postId),
      });
    },
  });
}

/**
 * Delete a comment
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { tribeId: string; postId: string; commentId: string }) =>
      deleteComment(params.tribeId, params.postId, params.commentId),
    onSuccess: (_, variables) => {
      // Invalidate comments query and post detail query
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.post(variables.postId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(variables.postId),
      });
    },
  });
}

/**
 * Like or unlike a comment with optimistic updates
 */
export function useLikeComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { tribeId: string; postId: string; commentId: string }) =>
      toggleCommentLike(params.tribeId, params.postId, params.commentId),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.comments.post(variables.postId),
      });

      // Snapshot the previous value for rollback
      const previousComments = queryClient.getQueryData<CommentWithStats[]>(
        queryKeys.comments.post(variables.postId)
      );

      // Optimistically update the comments list
      queryClient.setQueryData<CommentWithStats[]>(
        queryKeys.comments.post(variables.postId),
        (old) => {
          if (!old) return old;
          return old.map((comment) => {
            if (comment.id === variables.commentId) {
              return {
                ...comment,
                isLiked: !comment.isLiked,
                likeCount: comment.isLiked ? comment.likeCount - 1 : comment.likeCount + 1,
              };
            }
            return comment;
          });
        }
      );

      // Return context with the previous value for rollback
      return { previousComments };
    },
    onError: (err, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousComments) {
        queryClient.setQueryData(
          queryKeys.comments.post(variables.postId),
          context.previousComments
        );
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate to ensure we have the latest data
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.post(variables.postId),
      });
    },
  });
}

