"use client";

import { useQuery } from "@tanstack/react-query";
import type { ActivityWithUser } from "@/lib/database/types";
import { queryKeys } from "@/lib/constants/query-keys";

const API_BASE = "/api/tribes";
const ACTIVITIES_API = "/api/activities";

/**
 * Fetch activities for a tribe
 */
export function useTribeActivities(tribeId: string, options?: { limit?: number; offset?: number }) {
  return useQuery<ActivityWithUser[]>({
    queryKey: queryKeys.activities.tribe(tribeId),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.limit) params.set("limit", options.limit.toString());
      if (options?.offset) params.set("offset", options.offset.toString());

      const response = await fetch(
        `${API_BASE}/${tribeId}/activities${params.toString() ? `?${params.toString()}` : ''}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch activities");
      }

      return response.json();
    },
  });
}

/**
 * Fetch activities from all tribes the user is a member of
 */
export function useUserActivities(options?: { limit?: number; offset?: number }) {
  return useQuery<ActivityWithUser[]>({
    queryKey: queryKeys.activities.users(),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.limit) params.set("limit", options.limit.toString());
      if (options?.offset) params.set("offset", options.offset.toString());

      const response = await fetch(
        `${ACTIVITIES_API}${params.toString() ? `?${params.toString()}` : ''}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch activities");
      }

      return response.json();
    },
  });
}

