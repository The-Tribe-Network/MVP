'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import {
  uploadAvatar,
  uploadPostImage,
  uploadAlbumCover,
  uploadTribeMedia,
  deleteMedia,
  type UploadResponse,
  type UploadPostImageParams,
  type UploadAlbumCoverParams,
  type UploadTribeMediaParams,
} from '@/lib/api/upload';

// Re-export types for backwards compatibility
export type UploadAvatarResponse = UploadResponse;
export type { UploadResponse };

/**
 * Hook for uploading avatar images
 */
export function useUploadAvatar() {
  return useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
  });
}

/**
 * Hook for uploading post images
 */
export function useUploadPostImage() {
  return useMutation({
    mutationFn: (params: UploadPostImageParams) => uploadPostImage(params),
  });
}

/**
 * Hook for deleting media
 */
export function useDeleteMedia() {
  return useMutation({
    mutationFn: (mediaId: string) => deleteMedia(mediaId),
  });
}

/**
 * Hook for uploading album cover images
 */
export function useUploadAlbumCover() {
  return useMutation({
    mutationFn: (params: UploadAlbumCoverParams) => uploadAlbumCover(params),
  });
}

/**
 * Upload media directly to a tribe with automatic query invalidation
 */
export function useUploadTribeMedia(tribeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { file: File; albumId?: string | null; addToAlbum?: boolean }) =>
      uploadTribeMedia({ tribeId, ...params }),
    onSuccess: () => {
      // Invalidate both media and album queries to trigger refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.media.tribe(tribeId)
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.albums.tribe(tribeId)
      });
    },
  });
}
