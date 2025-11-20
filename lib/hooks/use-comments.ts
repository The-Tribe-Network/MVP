"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CommentWithAuthor } from "@/lib/database/types";
import { queryKeys } from "@/lib/constants/query-keys";

const API_BASE = "/api/tribes";

type CommentWithStats = CommentWithAuthor & {
  likeCount: number;
  isLiked: boolean;
};

type CreateCommentInput = {
  content: string;
  parentCommentId?: string;
};

type UpdateCommentInput = {
  content: string;
};

/**
 * Fetch comments for a post
 */
export function usePostComments(tribeId: string, postId: string) {
  return useQuery<CommentWithStats[]>({
    queryKey: queryKeys.comments.post(postId),
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/${tribeId}/posts/${postId}/comments`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch comments");
      }

      return response.json();
    },
  });
}

/**
 * Create a new comment
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tribeId,
      postId,
      data,
    }: {
      tribeId: string;
      postId: string;
      data: CreateCommentInput;
    }): Promise<CommentWithAuthor> => {
      const response = await fetch(`${API_BASE}/${tribeId}/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create comment");
      }

      return response.json();
    },
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
    mutationFn: async ({
      tribeId,
      postId,
      commentId,
      data,
    }: {
      tribeId: string;
      postId: string;
      commentId: string;
      data: UpdateCommentInput;
    }): Promise<CommentWithAuthor> => {
      const response = await fetch(
        `${API_BASE}/${tribeId}/posts/${postId}/comments/${commentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update comment");
      }

      return response.json();
    },
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
    mutationFn: async ({
      tribeId,
      postId,
      commentId,
    }: {
      tribeId: string;
      postId: string;
      commentId: string;
    }): Promise<void> => {
      const response = await fetch(
        `${API_BASE}/${tribeId}/posts/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete comment");
      }
    },
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
 * Like or unlike a comment
 */
export function useLikeComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tribeId,
      postId,
      commentId,
    }: {
      tribeId: string;
      postId: string;
      commentId: string;
    }): Promise<{ isLiked: boolean }> => {
      const response = await fetch(
        `${API_BASE}/${tribeId}/posts/${postId}/comments/${commentId}/like`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to toggle like");
      }

      return response.json();
    },
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

