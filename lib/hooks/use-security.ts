"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import type { ChangePasswordInput } from "@/lib/validations/security";
import { toast } from "sonner";
import { sessionsOptions } from "@/lib/query-options/security";
import {
  changePassword,
  revokeSession,
  revokeOtherSessions,
  type ChangePasswordParams,
} from "@/lib/api/security";

// Re-export types for backwards compatibility
export type { ChangePasswordParams };

/**
 * Fetch all active sessions for the current user
 */
export function useSessions() {
  return useQuery(sessionsOptions());
}

/**
 * Change user password
 */
export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChangePasswordInput) => changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully");
      // Invalidate auth queries since password change might affect session
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
    onError: (error: Error) => {
      toast.error("Error", {
        description: error.message,
      });
    },
  });
}

/**
 * Revoke a specific session
 */
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionToken: string) => revokeSession(sessionToken),
    onSuccess: () => {
      toast.success("Session revoked successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.security.sessions() });
    },
    onError: (error: Error) => {
      toast.error("Error", {
        description: error.message,
      });
    },
  });
}

/**
 * Revoke all other sessions except the current one
 */
export function useRevokeOtherSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => revokeOtherSessions(),
    onSuccess: () => {
      toast.success("All other sessions revoked successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.security.sessions() });
    },
    onError: (error: Error) => {
      toast.error("Error", {
        description: error.message,
      });
    },
  });
}



