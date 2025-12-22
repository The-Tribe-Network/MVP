import type { DiscoverTribe, DiscoverTribesParams } from '@/lib/api/discover';

// Re-export API types for convenience
export type { DiscoverTribe, DiscoverTribesParams, DiscoverTribesResponse } from '@/lib/api/discover';

/**
 * Category definition for the discover page filter
 */
export interface Category {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Filter state for the discover page
 */
export interface DiscoverFilters {
  search: string;
  category: string;
}

