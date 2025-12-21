import { queryOptions } from '@tanstack/react-query';
import { fetchSecuritySettings } from '@/lib/api/security';

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching security settings
 */
export function securitySettingsOptions() {
  return queryOptions({
    queryKey: ['security', 'settings'],
    queryFn: fetchSecuritySettings,
  });
}
