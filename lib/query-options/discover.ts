import { queryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import {
  fetchDiscoverTribes,
  fetchFeaturedTribes,
  type DiscoverTribesParams,
} from '@/lib/api/discover';

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching tribes for discovery
 */
export function discoverTribesOptions(params: DiscoverTribesParams = {}) {
  return queryOptions({
    queryKey: queryKeys.discover.tribes(params),
    queryFn: () => fetchDiscoverTribes(params),
  });
}

/**
 * Query options for fetching featured tribes
 */
export function featuredTribesOptions() {
  return queryOptions({
    queryKey: queryKeys.discover.featured(),
    queryFn: fetchFeaturedTribes,
  });
}

