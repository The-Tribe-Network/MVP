"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TribeWithCreator, TribeWithMembers } from "@/lib/database/types";
import { queryKeys } from "@/lib/constants/query-keys";

const API_BASE = "/api/tribes";

/**
 * Create a new tribe
 */
export function useCreateTribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      avatar?: string;
      location?: string;
      privacy?: "private" | "public";
      category?: "social" | "gaming" | "family" | "work" | "hobbies" | "other";
      invitations?: Array<{ email: string; role: "admin" | "moderator" | "member" }>;
    }): Promise<TribeWithCreator> => {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create tribe");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate tribe list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tribes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tribes.lists() });
    },
  });
}

/**
 * Fetch all tribes the current user is a member of
 * Returns basic tribe information for sidebar display
 */
export function useUserTribes() {
  return useQuery<Array<{ id: string; name: string; avatar: string | null }>>({
    queryKey: queryKeys.tribes.lists(),
    queryFn: async (): Promise<Array<{ id: string; name: string; avatar: string | null }>> => {
      const response = await fetch(API_BASE);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch user tribes");
      }

      return response.json();
    },
  });
}

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
