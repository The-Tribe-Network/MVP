"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";

const API_BASE = "/api/tribes";

export interface Album {
  id: string;
  tribeId: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  privacy: "public" | "private" | "admin_only";
  createdAt: Date;
  updatedAt: Date;
  creator: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  mediaCount: number;
}

export interface AlbumsResponse {
  albums: Album[];
}

/**
 * Fetch albums for a tribe
 */
export function useTribeAlbums(tribeId: string, options?: { limit?: number; offset?: number }) {
  return useQuery<Album[]>({
    queryKey: queryKeys.albums.tribe(tribeId),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.limit) params.set("limit", options.limit.toString());
      if (options?.offset) params.set("offset", options.offset.toString());

      const response = await fetch(
        `${API_BASE}/${tribeId}/albums${params.toString() ? `?${params.toString()}` : ''}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch albums");
      }

      const data: AlbumsResponse = await response.json();
      return data.albums;
    },
  });
}


interface CreateAlbumInput {
  name: string;
  description?: string;
  privacy?: "public" | "private" | "admin_only";
  coverId?: string;
  mediaIds?: string[];
  isNewCover?: boolean; // If true, the cover is a new upload and we query the normal media table instead of the album media table
}

/**
 * Create album with cover and media
 */
export function useCreateAlbum(tribeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAlbumInput) => {
      const response = await fetch(`${API_BASE}/${tribeId}/albums`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create album');
      }

      const data = await response.json();
      return data.album;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.albums.tribe(tribeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.media.tribe(tribeId) });
    },
  });
}
