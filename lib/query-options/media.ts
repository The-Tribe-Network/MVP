import { queryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { fetchTribeMedia, fetchMediaById, fetchPublicMedia, type MediaFilters } from '@/lib/api/media';

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching tribe media with optional filters
 */
export function tribeMediaOptions(
  tribeId: string,
  filters?: MediaFilters
) {
  // Normalize filters for query key (remove undefined values)
  const filtersObject = filters
    ? Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    )
    : undefined;

  return queryOptions({
    queryKey: queryKeys.media.tribe(tribeId, filtersObject),
    queryFn: () => fetchTribeMedia(tribeId, filters),
  });
}

/**
 * Query options for fetching a single media item
 */
export function mediaDetailOptions(tribeId: string, mediaId: string) {
  return queryOptions({
    queryKey: queryKeys.media.detail(mediaId),
    queryFn: () => fetchMediaById(tribeId, mediaId),
  });
}

/**
 * Query options for fetching public media
 */
export function publicMediaOptions(
  tribeId: string,
  options?: { limit?: number; offset?: number }
) {
  return queryOptions({
    queryKey: queryKeys.media.tribe(tribeId, { public: true }),
    queryFn: () => fetchPublicMedia(tribeId, options),
  });
}
