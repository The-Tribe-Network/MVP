"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import type { TribeWithMembers } from "@/lib/database/types";

const API_BASE = "/api/tribes";

/**
 * Fetch a single tribe by ID
 * This hook will use prefetched data from the server if available
 */
export function useTribe(id: string | null | undefined) {
  return useQuery<TribeWithMembers>({
    queryKey: queryKeys.tribes.tribe(id),
    queryFn: async (): Promise<TribeWithMembers> => {
      if (!id) {
        throw new Error("Tribe ID is required");
      }

      const response = await fetch(`${API_BASE}/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Tribe not found");
        }
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch tribe");
      }

      return response.json();
    },
    enabled: !!id,
  });
}
