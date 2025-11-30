'use client';

import { useMutation } from '@tanstack/react-query';

export interface UploadAvatarResponse {
  id: string;
  url: string;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
}

/**
 * Hook for uploading avatar images
 */
export function useUploadAvatar() {
  return useMutation({
    mutationFn: async (file: File): Promise<UploadAvatarResponse> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload avatar');
      }

      return response.json();
    },
  });
}

/**
 * Hook for uploading post images
 */
export function useUploadPostImage() {
  return useMutation({
    mutationFn: async ({
      file,
      tribeId,
      postId,
      albumId,
    }: {
      file: File;
      tribeId: string;
      postId?: string | null;
      albumId?: string | null;
    }): Promise<UploadAvatarResponse> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tribeId', tribeId);
      if (postId) {
        formData.append('postId', postId);
      }
      // Only append albumId if it's a valid string (not null/undefined)
      // null means "General" (no specific album), so we don't send it
      if (albumId) {
        formData.append('albumId', albumId);
      }

      const response = await fetch('/api/upload/post-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload post image');
      }

      return response.json();
    },
  });
}

/**
 * Hook for deleting media
 */
export function useDeleteMedia() {
  return useMutation({
    mutationFn: async (mediaId: string): Promise<void> => {
      const response = await fetch(`/api/media/${mediaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete media');
      }
    },
  });
}

