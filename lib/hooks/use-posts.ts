"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PostWithAuthor } from "@/lib/database/types";
import { queryKeys } from "@/lib/constants/query-keys";

const API_BASE = "/api/tribes";

type PostWithStats = PostWithAuthor & {
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  image: { id: string; url: string; width?: number; height?: number } | null;
};

type CreatePostInput = {
  content: string;
  mediaId?: string | null;
  albumId?: string | null;
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
 * Fetch a single post by ID
 */
export function usePost(tribeId: string, postId: string) {
  return useQuery<PostWithStats>({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/${tribeId}/posts/${postId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch post");
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
        body: JSON.stringify({
          content: data.content,
          mediaId: data.mediaId || null,
          albumId: data.albumId || null,
        }),
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
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.detail(variables.postId) });

      // Snapshot the previous values for rollback
      const previousPosts = queryClient.getQueryData<PostWithStats[]>(
        queryKeys.posts.tribe(variables.tribeId)
      );
      const previousPost = queryClient.getQueryData<PostWithStats>(
        queryKeys.posts.detail(variables.postId)
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

      // Optimistically update the post detail
      queryClient.setQueryData<PostWithStats>(
        queryKeys.posts.detail(variables.postId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            isLiked: !old.isLiked,
            likeCount: old.isLiked ? old.likeCount - 1 : old.likeCount + 1,
          };
        }
      );

      // Return context with the previous values for rollback
      return { previousPosts, previousPost };
    },
    onError: (err, variables, context) => {
      // Rollback to previous values on error
      if (context?.previousPosts) {
        queryClient.setQueryData(
          queryKeys.posts.tribe(variables.tribeId),
          context.previousPosts
        );
      }
      if (context?.previousPost) {
        queryClient.setQueryData(
          queryKeys.posts.detail(variables.postId),
          context.previousPost
        );
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate to ensure we have the latest data (including activity updates)
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.tribe(variables.tribeId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(variables.postId),
      });
      // Also invalidate activities to show new like milestone activities
      queryClient.invalidateQueries({
        queryKey: queryKeys.activities.tribe(variables.tribeId),
      });
    },
  });
}

