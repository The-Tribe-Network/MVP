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

