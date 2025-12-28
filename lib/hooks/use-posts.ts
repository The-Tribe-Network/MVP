"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PostWithStats } from "@/lib/database/types";
import { queryKeys } from "@/lib/constants/query-keys";
import { tribePostsOptions, postDetailOptions, type PostFilterOptions } from "@/lib/query-options/posts";
import {
  createPost,
  updatePost,
  deletePost,
  togglePostLike,
  type CreatePostParams,
  type UpdatePostParams,
  type PostSortOption,
  type PostContentType,
} from "@/lib/api/posts";

// Re-export types for convenience
export type { PostSortOption, PostContentType, PostFilterOptions };

/**
 * Fetch posts for a tribe with optional filters
 */
export function useTribePosts(tribeId: string, options?: PostFilterOptions) {
  return useQuery(tribePostsOptions(tribeId, options));
}

/**
 * Fetch a single post by ID
 */
export function usePost(tribeId: string, postId: string) {
  return useQuery(postDetailOptions(tribeId, postId));
}

/**
 * Create a new post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreatePostParams) => createPost(params),
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
    mutationFn: (params: UpdatePostParams) => updatePost(params),
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
    mutationFn: (params: { tribeId: string; postId: string }) =>
      deletePost(params.tribeId, params.postId),
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
 * Like or unlike a post with optimistic updates
 */
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { tribeId: string; postId: string }) =>
      togglePostLike(params.tribeId, params.postId),
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

