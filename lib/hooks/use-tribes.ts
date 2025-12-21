"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TribeWithCreator } from "@/lib/database/types";
import { queryKeys } from "@/lib/constants/query-keys";
import { useAuthUser } from "./use-auth";
import { userTribesOptions, tribeDetailOptions, userInvitationsOptions } from "@/lib/query-options/tribes";
import {
  createTribe,
  sendTribeInvitations,
  acceptInvitation,
  rejectInvitation,
  leaveTribe,
  type CreateTribeParams,
  type SendInvitationsParams,
  type UserInvitation,
} from "@/lib/api/tribes";

// Re-export types for backwards compatibility
export type { UserInvitation };

/**
 * Create a new tribe
 */
export function useCreateTribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTribe,
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

  return useQuery({
    ...userTribesOptions(),
    enabled: isAuthenticated, // Add enabled condition at hook level
  });
}

/**
 * Fetch a single tribe by ID
 * This hook will use prefetched data from the server if available
 */
export function useTribe(id: string | null | undefined) {
  return useQuery({
    ...tribeDetailOptions(id),
    enabled: !!id, // Add enabled condition at hook level
  });
}

/**
 * Send invitations to a tribe
 */
export function useSendTribeInvitations(tribeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { invitations: Array<{ email: string; role: "admin" | "moderator" | "member" }> }) =>
      sendTribeInvitations({ tribeId, ...data }),
    onSuccess: () => {
      // Invalidate tribe data to refresh member count
      queryClient.invalidateQueries({ queryKey: queryKeys.tribes.tribe(tribeId) });
    },
  });
}

/**
 * Fetch pending invitations for the current user
 */
export function useUserInvitations() {
  return useQuery(userInvitationsOptions());
}

/**
 * Accept an invitation
 */
export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptInvitation,
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
    mutationFn: rejectInvitation,
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
    mutationFn: leaveTribe,
    onSuccess: (_, tribeId) => {
      // Invalidate tribe queries and user tribes list
      queryClient.invalidateQueries({ queryKey: queryKeys.tribes.tribe(tribeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tribes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tribes.lists() });
    },
  });
}