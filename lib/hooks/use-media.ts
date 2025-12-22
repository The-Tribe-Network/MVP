"use client";

import { useQuery } from "@tanstack/react-query";
import { tribeMediaOptions, publicMediaOptions } from "@/lib/query-options/media";
import type { MediaFilters } from "@/lib/api/media";

// Re-export types for backwards compatibility
export type { MediaItem, MediaFilters } from "@/lib/api/media";

/**
 * Fetch media for a tribe with optional filters
 */
export function useTribeMedia(tribeId: string, filters?: MediaFilters) {
  return useQuery(tribeMediaOptions(tribeId, filters));
}

/**
 * Fetch public media for album creation selection
 */
export function usePublicMedia(tribeId: string, options?: { limit?: number; offset?: number }) {
  return useQuery(publicMediaOptions(tribeId, options));
}
