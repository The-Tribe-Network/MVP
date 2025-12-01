"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import type { SessionWithDevice } from "@/lib/database/types";
import type { ChangePasswordInput } from "@/lib/validations/security";
import { toast } from "@/components/ui/use-toast";

const API_BASE = "/api/user/security";

/**
 * Fetch all active sessions for the current user
 */
export function useSessions() {
  return useQuery<SessionWithDevice[]>({
    queryKey: queryKeys.security.sessions(),
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/sessions`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch sessions");
      }

      return response.json();
    },
  });
}

/**
 * Change user password
 */
export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ChangePasswordInput): Promise<{ success: boolean; message: string }> => {
      const response = await fetch(`${API_BASE}/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to change password");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
      // Invalidate auth queries since password change might affect session
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
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
    mutationFn: async (sessionToken: string): Promise<{ success: boolean; message: string }> => {
      const response = await fetch(`${API_BASE}/sessions`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionToken }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to revoke session");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Session revoked successfully",
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.security.sessions() });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
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
    mutationFn: async (): Promise<{ success: boolean; message: string }> => {
      const response = await fetch(`${API_BASE}/sessions`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to revoke other sessions");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All other sessions revoked successfully",
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.security.sessions() });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}



