// NOTE: Cannot use apiFetch for uploads since FormData should not have Content-Type header
// The browser sets it automatically with the correct boundary

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

export interface UploadAlbumCoverParams {
  file: File;
  tribeId: string;
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

  const response = await fetch('/api/upload/avatar', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload avatar');
  }

  return response.json();
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

  const response = await fetch('/api/upload/post-image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload post image');
  }

  return response.json();
}

/**
 * Upload an album cover image
 */
export async function uploadAlbumCover(
  params: UploadAlbumCoverParams
): Promise<UploadResponse> {
  const { file, tribeId } = params;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tribeId', tribeId);

  const response = await fetch('/api/upload/album-cover', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload album cover');
  }

  return response.json();
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

  const response = await fetch(`/api/tribes/${tribeId}/media`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload media');
  }

  return response.json();
}

/**
 * Delete media
 */
export async function deleteMedia(mediaId: string): Promise<void> {
  const response = await fetch(`/api/media/${mediaId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete media');
  }
}
