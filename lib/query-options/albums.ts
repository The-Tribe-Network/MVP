import { queryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { fetchTribeAlbums, fetchAlbumById } from '@/lib/api/albums';

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching tribe albums
 */
export function tribeAlbumsOptions(tribeId: string) {
  return queryOptions({
    queryKey: queryKeys.albums.tribe(tribeId),
    queryFn: () => fetchTribeAlbums(tribeId),
  });
}

/**
 * Query options for fetching a single album by ID
 */
export function albumDetailOptions(tribeId: string, albumId: string) {
  return queryOptions({
    queryKey: queryKeys.albums.detail(tribeId, albumId),
    queryFn: () => fetchAlbumById(tribeId, albumId),
  });
}

/**
 * Query options for fetching popular albums (sorted by photo count)
 * Uses the same tribeAlbums query but components will sort by photoCount
 */
export function popularAlbumsOptions(tribeId: string) {
  return queryOptions({
    queryKey: queryKeys.popularAlbums.tribe(tribeId),
    queryFn: () => fetchTribeAlbums(tribeId),
    staleTime: 1000 * 60, // 1 minute
  });
}
