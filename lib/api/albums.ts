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

export interface AlbumResponse {
  album: AlbumWithMedia;
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
