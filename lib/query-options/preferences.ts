import { queryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { fetchTribeMemberPreferences } from '@/lib/api/preferences';

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching tribe member preferences
 * Includes placeholder data for default values
 */
export function tribeMemberPreferencesOptions(tribeId: string) {
  return queryOptions({
    queryKey: queryKeys.preferences.tribeMember(tribeId),
    queryFn: () => fetchTribeMemberPreferences(tribeId),
    placeholderData: { autoAddPostMediaToTribe: true }, // Default preference
  });
}
