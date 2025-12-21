"use client";

import { useQuery } from "@tanstack/react-query";
import { tribeMemberPreferencesOptions } from "@/lib/query-options/preferences";

// Re-export types for backwards compatibility
export type { TribeMemberPreferences } from "@/lib/api/preferences";

/**
 * Fetch tribe member preferences for a specific tribe
 * Returns default value of { autoAddPostMediaToTribe: true } if not found
 */
export function useTribeMemberPreferences(tribeId: string) {
  return useQuery(tribeMemberPreferencesOptions(tribeId));
}

