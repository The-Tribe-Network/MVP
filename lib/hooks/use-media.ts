"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import type { MediaWithAlbumInfo } from "@/lib/database/types";

const API_BASE = "/api/tribes";

export type MediaItem = MediaWithAlbumInfo;

export interface MediaResponse {
  media: MediaItem[];
}

export interface MediaFilters {
  albumId?: string | null;
  type?: "image" | "video" | "document";
  limit?: number;
  offset?: number;
}

/**
 * Fetch media for a tribe with optional filters
 */
export function useTribeMedia(tribeId: string, filters?: MediaFilters) {
  const filtersObject = filters ? Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== undefined)) : undefined;

  return useQuery<MediaItem[]>({
    queryKey: queryKeys.media.tribe(tribeId, filtersObject),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.albumId !== undefined) {
        params.set("albumId", filters.albumId === null ? "null" : filters.albumId);
      }
      if (filters?.type) {
        params.set("type", filters.type);
      }
      if (filters?.limit) {
        params.set("limit", filters.limit.toString());
      }
      if (filters?.offset) {
        params.set("offset", filters.offset.toString());
      }

      const response = await fetch(
        `${API_BASE}/${tribeId}/media${params.toString() ? `?${params.toString()}` : ''}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch media");
      }

      const data: MediaResponse = await response.json();
      return data.media;
    },
  });
}


/**
 * Fetch public media for album creation selection
 */
export function usePublicMedia(tribeId: string, options?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: queryKeys.media.tribe(tribeId, { public: true }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.limit) params.set('limit', options.limit.toString());
      if (options?.offset) params.set('offset', options.offset.toString());

      const url = `${API_BASE}/${tribeId}/media/public`;
      const queryString = params.toString();
      const response = await fetch(queryString ? `${url}?${queryString}` : url);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch public media');
      }

      const data = await response.json();
      return data.media;
    },
  });
}
