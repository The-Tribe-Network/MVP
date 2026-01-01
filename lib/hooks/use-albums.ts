"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import { tribeAlbumsOptions, popularAlbumsOptions, albumDetailOptions } from "@/lib/query-options/albums";
import {
  createAlbum,
  updateAlbum,
  deleteAlbum,
  addMediaToAlbum,
  removeMediaFromAlbum,
  type CreateAlbumInput,
  type UpdateAlbumParams,
  type DeleteAlbumParams,
  type AlbumMediaParams,
} from "@/lib/api/albums";

// Re-export types for backwards compatibility
export type { CreateAlbumInput, UpdateAlbumParams, DeleteAlbumParams, AlbumMediaParams };

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

/**
 * Fetch a single album by ID
 */
export function useAlbumDetail(tribeId: string, albumId: string) {
  return useQuery(albumDetailOptions(tribeId, albumId));
}

/**
 * Update an album's details
 */
export function useUpdateAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateAlbumParams) => updateAlbum(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.albums.detail(variables.tribeId, variables.albumId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.albums.tribe(variables.tribeId),
      });
    },
  });
}

/**
 * Delete an album
 */
export function useDeleteAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteAlbumParams) => deleteAlbum(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.albums.tribe(variables.tribeId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.media.tribe(variables.tribeId),
      });
    },
  });
}

/**
 * Add media items to an album
 */
export function useAddMediaToAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: AlbumMediaParams) => addMediaToAlbum(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.albums.detail(variables.tribeId, variables.albumId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.albums.tribe(variables.tribeId),
      });
    },
  });
}

/**
 * Remove media items from an album
 */
export function useRemoveMediaFromAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: AlbumMediaParams) => removeMediaFromAlbum(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.albums.detail(variables.tribeId, variables.albumId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.albums.tribe(variables.tribeId),
      });
    },
  });
}
