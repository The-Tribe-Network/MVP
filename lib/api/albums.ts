import { apiFetch } from './client';
import type { AlbumWithMedia } from '@/lib/database/types';

const API_BASE = '/api/tribes';

// ============================================================================
// Types
// ============================================================================

export interface AlbumsResponse {
  albums: AlbumWithMedia[];
}

export interface CreateAlbumInput {
  name: string;
  description?: string;
  privacy?: 'public' | 'private' | 'admin_only';
  coverId?: string;
  mediaIds?: string[];
  isNewCover?: boolean;
}

export interface CreateAlbumParams {
  tribeId: string;
  input: CreateAlbumInput;
}

export interface UpdateAlbumInput {
  name?: string;
  description?: string;
  coverId?: string;
  privacy?: 'public' | 'private' | 'admin_only';
}

export interface UpdateAlbumParams {
  tribeId: string;
  albumId: string;
  data: UpdateAlbumInput;
}

export interface DeleteAlbumParams {
  tribeId: string;
  albumId: string;
}

export interface AlbumMediaParams {
  tribeId: string;
  albumId: string;
  mediaIds: string[];
}

export interface AlbumResponse {
  album: AlbumWithMedia;
}

export interface AlbumMediaResponse {
  success: boolean;
  count: number;
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Fetch albums for a tribe
 */
export async function fetchTribeAlbums(tribeId: string): Promise<AlbumWithMedia[]> {
  const response = await apiFetch<AlbumsResponse>(`${API_BASE}/${tribeId}/albums`);
  return response.albums;
}

/**
 * Fetch a single album by ID
 */
export async function fetchAlbumById(
  tribeId: string,
  albumId: string
): Promise<AlbumWithMedia> {
  const response = await apiFetch<AlbumResponse>(
    `${API_BASE}/${tribeId}/albums/${albumId}`
  );
  return response.album;
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Create a new album
 */
export async function createAlbum(
  params: CreateAlbumParams
): Promise<AlbumWithMedia> {
  const { tribeId, input } = params;
  const response = await apiFetch<AlbumResponse>(
    `${API_BASE}/${tribeId}/albums`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }
  );
  return response.album;
}

/**
 * Update an album's details
 */
export async function updateAlbum(
  params: UpdateAlbumParams
): Promise<AlbumWithMedia> {
  const { tribeId, albumId, data } = params;
  const response = await apiFetch<AlbumResponse>(
    `${API_BASE}/${tribeId}/albums/${albumId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  return response.album;
}

/**
 * Delete an album
 */
export async function deleteAlbum(
  params: DeleteAlbumParams
): Promise<{ message: string }> {
  const { tribeId, albumId } = params;
  return apiFetch<{ message: string }>(
    `${API_BASE}/${tribeId}/albums/${albumId}`,
    {
      method: 'DELETE',
    }
  );
}

/**
 * Add media items to an album
 */
export async function addMediaToAlbum(
  params: AlbumMediaParams
): Promise<AlbumMediaResponse> {
  const { tribeId, albumId, mediaIds } = params;
  return apiFetch<AlbumMediaResponse>(
    `${API_BASE}/${tribeId}/albums/${albumId}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaIds }),
    }
  );
}

/**
 * Remove media items from an album
 */
export async function removeMediaFromAlbum(
  params: AlbumMediaParams
): Promise<AlbumMediaResponse> {
  const { tribeId, albumId, mediaIds } = params;
  return apiFetch<AlbumMediaResponse>(
    `${API_BASE}/${tribeId}/albums/${albumId}/media`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaIds }),
    }
  );
}
