import { queryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { fetchTribeAlbums } from '@/lib/api/albums';

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
