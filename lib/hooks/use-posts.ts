"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PostWithAuthor } from "@/lib/database/types";
import { queryKeys } from "@/lib/constants/query-keys";

const API_BASE = "/api/tribes";

type PostWithStats = PostWithAuthor & {
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
};

type CreatePostInput = {
  content: string;
};

type UpdatePostInput = {
  content: string;
};

/**
 * Fetch posts for a tribe
 */
export function useTribePosts(tribeId: string, options?: { limit?: number; offset?: number }) {
  return useQuery<PostWithStats[]>({
    queryKey: queryKeys.posts.tribe(tribeId),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.limit) params.set("limit", options.limit.toString());
      if (options?.offset) params.set("offset", options.offset.toString());

      const response = await fetch(
        `${API_BASE}/${tribeId}/posts${params.toString() ? `?${params.toString()}` : ''}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch posts");
      }

      return response.json();
    },
  });
}

/**
 * Create a new post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tribeId,
      data,
    }: {
      tribeId: string;
      data: CreatePostInput;
    }): Promise<PostWithAuthor> => {
      const response = await fetch(`${API_BASE}/${tribeId}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create post");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate tribe posts query
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.tribe(variables.tribeId),
      });
    },
  });
}

/**
 * Update a post
 */
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tribeId,
      postId,
      data,
    }: {
      tribeId: string;
      postId: string;
      data: UpdatePostInput;
    }): Promise<PostWithAuthor> => {
      const response = await fetch(`${API_BASE}/${tribeId}/posts/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update post");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate tribe posts query and post detail query
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.tribe(variables.tribeId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(variables.postId),
      });
    },
  });
}

/**
 * Delete a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tribeId,
      postId,
    }: {
      tribeId: string;
      postId: string;
    }): Promise<void> => {
      const response = await fetch(`${API_BASE}/${tribeId}/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete post");
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate tribe posts query and post detail query
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.tribe(variables.tribeId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(variables.postId),
      });
    },
  });
}

/**
 * Like or unlike a post
 */
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tribeId,
      postId,
    }: {
      tribeId: string;
      postId: string;
    }): Promise<{ isLiked: boolean }> => {
      const response = await fetch(`${API_BASE}/${tribeId}/posts/${postId}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to toggle like");
      }

      return response.json();
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.tribe(variables.tribeId) });

      // Snapshot the previous value for rollback
      const previousPosts = queryClient.getQueryData<PostWithStats[]>(
        queryKeys.posts.tribe(variables.tribeId)
      );

      // Optimistically update the posts list
      queryClient.setQueryData<PostWithStats[]>(
        queryKeys.posts.tribe(variables.tribeId),
        (old) => {
          if (!old) return old;
          return old.map((post) => {
            if (post.id === variables.postId) {
              return {
                ...post,
                isLiked: !post.isLiked,
                likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
              };
            }
            return post;
          });
        }
      );

      // Return context with the previous value for rollback
      return { previousPosts };
    },
    onError: (err, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousPosts) {
        queryClient.setQueryData(
          queryKeys.posts.tribe(variables.tribeId),
          context.previousPosts
        );
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate to ensure we have the latest data (including activity updates)
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.tribe(variables.tribeId),
      });
      // Also invalidate activities to show new like milestone activities
      queryClient.invalidateQueries({
        queryKey: queryKeys.activities.tribe(variables.tribeId),
      });
    },
  });
}

