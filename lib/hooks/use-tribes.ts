"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TribeWithCreator, TribeWithMembers } from "@/lib/database/types";

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
      queryClient.invalidateQueries({ queryKey: ["tribes"] });
    },
  });
}

/**
 * Fetch a single tribe by ID
 */
export function useTribe(id: string | null | undefined) {
  return useQuery({
    queryKey: ["tribe", id],
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
