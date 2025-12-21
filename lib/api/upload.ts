import { apiFetch } from './client';

// ============================================================================
// Types
// ============================================================================

export interface UploadResponse {
  id: string;
  url: string;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
}

export interface UploadPostImageParams {
  file: File;
  tribeId: string;
  postId?: string | null;
  albumId?: string | null;
}

export interface UploadAlbumImageParams {
  file: File;
  tribeId: string;
  albumId: string;
}

export interface UploadTribeMediaParams {
  tribeId: string;
  file: File;
  albumId?: string | null;
  addToAlbum?: boolean;
}

// ============================================================================
// Upload Functions
// ============================================================================

/**
 * Upload an avatar image
 */
export async function uploadAvatar(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  return apiFetch<UploadResponse>('/api/upload/avatar', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Upload a post image
 */
export async function uploadPostImage(
  params: UploadPostImageParams
): Promise<UploadResponse> {
  const { file, tribeId, postId, albumId } = params;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tribeId', tribeId);
  if (postId) formData.append('postId', postId);
  if (albumId) formData.append('albumId', albumId);

  return apiFetch<UploadResponse>('/api/upload/post-image', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Upload an image to an album
 */
export async function uploadAlbumImage(
  params: UploadAlbumImageParams
): Promise<UploadResponse> {
  const { file, tribeId, albumId } = params;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tribeId', tribeId);
  formData.append('albumId', albumId);

  return apiFetch<UploadResponse>('/api/upload/album-image', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Upload media to a tribe
 */
export async function uploadTribeMedia(
  params: UploadTribeMediaParams
): Promise<UploadResponse> {
  const { tribeId, file, albumId, addToAlbum } = params;
  const formData = new FormData();
  formData.append('file', file);

  if (addToAlbum !== undefined) {
    formData.append('addToAlbum', addToAlbum.toString());
  }
  if (albumId) {
    formData.append('albumId', albumId);
  }

  return apiFetch<UploadResponse>(
    `/api/tribes/${tribeId}/media`,
    {
      method: 'POST',
      body: formData,
    }
  );
}
