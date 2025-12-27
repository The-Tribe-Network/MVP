'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import {
  uploadAvatar,
  uploadTribeAvatar,
  uploadPostImage,
  uploadAlbumCover,
  uploadEventCover,
  uploadTribeBanner,
  uploadTribeMedia,
  uploadTribeMediaBatch,
  deleteMedia,
  type UploadResponse,
  type UploadPostImageParams,
  type UploadAlbumCoverParams,
  type UploadEventCoverParams,
  type UploadTribeBannerParams,
  type UploadTribeAvatarParams,
  type UploadTribeMediaParams,
  type BatchUploadResult,
} from '@/lib/api/upload';

// Re-export types for backwards compatibility
export type UploadAvatarResponse = UploadResponse;
export type { UploadResponse };

/**
 * Hook for uploading avatar images (user profile)
 */
export function useUploadAvatar() {
  return useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
  });
}

/**
 * Hook for uploading tribe avatar images (does not update user profile)
 */
export function useUploadTribeAvatar() {
  return useMutation({
    mutationFn: (params: UploadTribeAvatarParams) => uploadTribeAvatar(params),
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
 * Hook for uploading event cover images
 */
export function useUploadEventCover() {
  return useMutation({
    mutationFn: (params: UploadEventCoverParams) => uploadEventCover(params),
  });
}

/**
 * Hook for uploading tribe banner images
 */
export function useUploadTribeBanner() {
  return useMutation({
    mutationFn: (params: UploadTribeBannerParams) => uploadTribeBanner(params),
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

/**
 * Batch upload multiple media files to a tribe with automatic query invalidation
 */
export function useUploadTribeMediaBatch(tribeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { files: File[]; albumId?: string | null; addToAlbum?: boolean }) =>
      uploadTribeMediaBatch({ tribeId, ...params }),
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

// Re-export BatchUploadResult type for consumers
export type { BatchUploadResult };
