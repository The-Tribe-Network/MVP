import { apiFetch, buildQueryString } from './client';
import type { MediaWithAlbumInfo } from '@/lib/database/types';

const API_BASE = '/api/tribes';

// ============================================================================
// Types
// ============================================================================

export type MediaItem = MediaWithAlbumInfo;

export interface MediaResponse {
  media: MediaItem[];
}

export interface MediaFilters {
  albumId?: string | null;
  type?: 'image' | 'video' | 'document';
  limit?: number;
  offset?: number;
}

export interface FetchTribeMediaParams {
  tribeId: string;
  filters?: MediaFilters;
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Fetch media for a tribe with optional filters
 */
export async function fetchTribeMedia(
  tribeId: string,
  filters?: MediaFilters
): Promise<MediaItem[]> {
  // Build query params with special handling for null albumId
  const params: Record<string, string> = {};
  if (filters) {
    if (filters.albumId !== undefined) {
      params.albumId = filters.albumId === null ? 'null' : filters.albumId;
    }
    if (filters.type) params.type = filters.type;
    if (filters.limit) params.limit = filters.limit.toString();
    if (filters.offset) params.offset = filters.offset.toString();
  }

  const queryString = buildQueryString(params);
  const response = await apiFetch<MediaResponse>(
    `${API_BASE}/${tribeId}/media${queryString}`
  );
  return response.media;
}

/**
 * Fetch a single media item by ID
 */
export async function fetchMediaById(
  tribeId: string,
  mediaId: string
): Promise<MediaItem> {
  return apiFetch<MediaItem>(
    `${API_BASE}/${tribeId}/media/${mediaId}`
  );
}

/**
 * Fetch public media for album creation selection
 */
export async function fetchPublicMedia(
  tribeId: string,
  options?: { limit?: number; offset?: number }
): Promise<MediaItem[]> {
  const queryString = options ? buildQueryString(options) : '';
  const response = await apiFetch<MediaResponse>(
    `${API_BASE}/${tribeId}/media/public${queryString}`
  );
  return response.media;
}
