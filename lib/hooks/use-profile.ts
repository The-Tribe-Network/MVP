"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import type { UpdateProfileInput } from "@/lib/validations/profile";

const API_BASE = "/api/user/profile";

/**
 * Fetch current user profile
 */
export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile.current(),
    queryFn: async () => {
      const response = await fetch(API_BASE);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch profile");
      }

      return response.json();
    },
  });
}

/**
 * Update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileInput): Promise<any> => {
      const response = await fetch(API_BASE, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate auth queries to refresh user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      // Also invalidate profile query
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.current() });
    },
  });
}

/**
 * Complete profile setup (combines update + mark complete)
 */
export function useCompleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileInput): Promise<any> => {
      // First update profile
      const updateResponse = await fetch(API_BASE, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        throw new Error(error.error || "Failed to update profile");
      }

      // Then mark as complete
      const completeResponse = await fetch(`${API_BASE}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!completeResponse.ok) {
        const error = await completeResponse.json();
        throw new Error(error.error || "Failed to complete profile");
      }

      return completeResponse.json();
    },
    onSuccess: () => {
      // Invalidate auth queries to refresh user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      // Also invalidate profile query
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.current() });
    },
  });
}

/**
 * Check username availability
 */
export function useCheckUsername() {
  return useMutation({
    mutationFn: async (username: string): Promise<{ available: boolean }> => {
      const response = await fetch(
        `/api/user/username/check?username=${encodeURIComponent(username)}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to check username");
      }

      return response.json();
    },
  });
}
