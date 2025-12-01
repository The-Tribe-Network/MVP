"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";

const API_BASE = "/api/tribes";

export interface TribeMemberPreferences {
  autoAddPostMediaToTribe: boolean;
}

export interface PreferencesResponse {
  preferences: TribeMemberPreferences;
}

/**
 * Fetch tribe member preferences for a specific tribe
 * Returns default value of { autoAddPostMediaToTribe: true } if not found
 */
export function useTribeMemberPreferences(tribeId: string) {
  return useQuery<TribeMemberPreferences>({
    queryKey: queryKeys.preferences.tribeMember(tribeId),
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/${tribeId}/members/preferences`);

      // If 404, return default preference
      if (response.status === 404) {
        return { autoAddPostMediaToTribe: true };
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch tribe member preferences");
      }

      const data: PreferencesResponse = await response.json();
      return data.preferences;
    },
    // Default value if query fails
    placeholderData: { autoAddPostMediaToTribe: true },
  });
}

