"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tribeMediaOptions, publicMediaOptions, featuredMediaOptions, popularPhotosOptions } from "@/lib/query-options/media";
import { updateFeaturedMedia, clearFeaturedMedia as clearFeaturedMediaApi } from "@/lib/api/tribes";
import { queryKeys } from "@/lib/constants/query-keys";
import type { MediaFilters } from "@/lib/api/media";

// Re-export types for backwards compatibility
export type { MediaItem, MediaFilters } from "@/lib/api/media";

/**
 * Fetch media for a tribe with optional filters
 */
export function useTribeMedia(tribeId: string, filters?: MediaFilters) {
  return useQuery(tribeMediaOptions(tribeId, filters));
}

/**
 * Fetch public media for album creation selection
 */
export function usePublicMedia(tribeId: string, options?: { limit?: number; offset?: number }) {
  return useQuery(publicMediaOptions(tribeId, options));
}

/**
 * Fetch the featured media for a tribe
 */
export function useFeaturedMedia(tribeId: string) {
  return useQuery(featuredMediaOptions(tribeId));
}

/**
 * Fetch popular photos for a tribe (sorted by likes)
 * Returns all photos - component should sort by likeCount
 */
export function usePopularPhotos(tribeId: string) {
  return useQuery(popularPhotosOptions(tribeId));
}

/**
 * Mutation to set the featured media for a tribe
 */
export function useSetFeaturedMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tribeId, mediaId }: { tribeId: string; mediaId: string }) =>
      updateFeaturedMedia(tribeId, mediaId),
    onSuccess: (_, { tribeId }) => {
      // Invalidate featured media query
      queryClient.invalidateQueries({ queryKey: queryKeys.media.featured(tribeId) });
    },
  });
}

/**
 * Mutation to clear the featured media for a tribe
 */
export function useClearFeaturedMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tribeId: string) => clearFeaturedMediaApi(tribeId),
    onSuccess: (_, tribeId) => {
      // Invalidate featured media query
      queryClient.invalidateQueries({ queryKey: queryKeys.media.featured(tribeId) });
    },
  });
}
