"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import { tribeAlbumsOptions, popularAlbumsOptions } from "@/lib/query-options/albums";
import { createAlbum, type CreateAlbumInput } from "@/lib/api/albums";

// Re-export types for backwards compatibility
export type { CreateAlbumInput };

/**
 * Fetch albums for a tribe
 */
export function useTribeAlbums(tribeId: string, options?: { limit?: number; offset?: number }) {
  return useQuery(tribeAlbumsOptions(tribeId));
}

/**
 * Fetch popular albums for a tribe (sorted by photo count)
 * Returns all albums - component should sort by photoCount
 */
export function usePopularAlbums(tribeId: string) {
  return useQuery(popularAlbumsOptions(tribeId));
}

/**
 * Create album with cover and media
 */
export function useCreateAlbum(tribeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAlbumInput) => createAlbum({ tribeId, input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.albums.tribe(tribeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.media.tribe(tribeId) });
    },
  });
}
