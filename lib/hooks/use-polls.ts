"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import { eventPollsOptions } from "@/lib/query-options/polls";
import {
  createPoll,
  deletePoll,
  votePoll,
  removeVote,
  type CreatePollInput,
  type CreatePollParams,
  type DeletePollParams,
  type VotePollParams,
  type RemoveVoteParams,
} from "@/lib/api/polls";

// Re-export types for backwards compatibility
export type { CreatePollInput };

/**
 * Fetch polls for an event
 */
export function useEventPolls(tribeId: string, eventId: string) {
  return useQuery(eventPollsOptions(tribeId, eventId));
}

/**
 * Create a new poll
 */
export function useCreatePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreatePollParams) => createPoll(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.polls.event(variables.eventId),
      });
    },
  });
}

/**
 * Delete a poll
 */
export function useDeletePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeletePollParams) => deletePoll(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.polls.event(variables.eventId),
      });
    },
  });
}

/**
 * Vote on a poll
 */
export function useVotePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: VotePollParams) => votePoll(params),
    onSuccess: (_, variables) => {
      // Optimistically invalidate to refetch with new vote counts
      queryClient.invalidateQueries({
        queryKey: queryKeys.polls.event(variables.eventId),
      });
    },
  });
}

/**
 * Remove vote from a poll
 */
export function useRemoveVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: RemoveVoteParams) => removeVote(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.polls.event(variables.eventId),
      });
    },
  });
}
