"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TribeWithCreator, TribeWithMembers } from "@/lib/database/types";
import { queryKeys } from "@/lib/constants/query-keys";
import { useAuthUser } from "./use-auth";

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
  const { isAuthenticated } = useAuthUser();

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
    enabled: isAuthenticated,
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

/**
 * Send invitations to a tribe
 */
export function useSendTribeInvitations(tribeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      invitations: Array<{ email: string; role: "admin" | "moderator" | "member" }>;
    }): Promise<{ success: boolean; message: string; invitations: any[] }> => {
      const response = await fetch(`${API_BASE}/${tribeId}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send invitations");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate tribe data to refresh member count
      queryClient.invalidateQueries({ queryKey: queryKeys.tribes.tribe(tribeId) });
    },
  });
}

/**
 * Invitation types
 */
export interface UserInvitation {
  id: string;
  tribeId: string;
  tribeName: string;
  tribeAvatar: string | null;
  invitedBy: string;
  inviterId: string;
  role: "admin" | "moderator" | "member";
  createdAt: Date;
  expiresAt: Date | null;
}

/**
 * Fetch pending invitations for the current user
 */
export function useUserInvitations() {
  return useQuery<UserInvitation[]>({
    queryKey: ["invitations", "user"],
    queryFn: async (): Promise<UserInvitation[]> => {
      const response = await fetch("/api/invitations");

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch invitations");
      }

      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds to keep invitations up to date
  });
}

/**
 * Accept an invitation
 */
export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string): Promise<{ success: boolean; message: string }> => {
      const response = await fetch(`/api/invitations/${invitationId}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to accept invitation");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate invitations list and user tribes
      queryClient.invalidateQueries({ queryKey: ["invitations", "user"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.tribes.all });
    },
  });
}

/**
 * Reject an invitation
 */
export function useRejectInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string): Promise<{ success: boolean; message: string }> => {
      const response = await fetch(`/api/invitations/${invitationId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reject invitation");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate invitations list
      queryClient.invalidateQueries({ queryKey: ["invitations", "user"] });
    },
  });
}

/**
 * Leave a tribe
 */
export function useLeaveTribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tribeId: string): Promise<{ success: boolean; message: string }> => {
      const response = await fetch(`${API_BASE}/${tribeId}/members`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to leave tribe");
      }

      return response.json();
    },
    onSuccess: (_, tribeId) => {
      // Invalidate tribe queries and user tribes list
      queryClient.invalidateQueries({ queryKey: queryKeys.tribes.tribe(tribeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tribes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tribes.lists() });
    },
  });
}