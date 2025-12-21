"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import type { UpdateProfileInput } from "@/lib/validations/profile";
import { profileOptions } from "@/lib/query-options/profile";
import {
  updateProfile,
  completeProfile,
  checkUsername,
  type UpdateProfileParams,
} from "@/lib/api/profile";

// Re-export types for backwards compatibility
export type { UpdateProfileParams };

/**
 * Fetch current user profile
 */
export function useProfile() {
  return useQuery(profileOptions());
}

/**
 * Update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => updateProfile(data),
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
    mutationFn: (data: UpdateProfileInput) => completeProfile(data),
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
    mutationFn: (username: string) => checkUsername(username),
  });
}
