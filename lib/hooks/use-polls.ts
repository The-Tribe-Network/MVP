"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PollWithDetails } from "@/lib/database/types";
import { queryKeys } from "@/lib/constants/query-keys";

const API_BASE = "/api/tribes";

type CreatePollInput = {
  question: string;
  options: string[];
  allowMultiple: boolean;
  isAnonymous: boolean;
  endsAt?: string;
};

export function useEventPolls(tribeId: string, eventId: string) {
  return useQuery<PollWithDetails[]>({
    queryKey: queryKeys.polls.event(eventId),
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE}/${tribeId}/events/${eventId}/polls`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch polls");
      }

      return response.json();
    },
  });
}

export function useCreatePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tribeId,
      eventId,
      data,
    }: {
      tribeId: string;
      eventId: string;
      data: CreatePollInput;
    }): Promise<PollWithDetails> => {
      const response = await fetch(
        `${API_BASE}/${tribeId}/events/${eventId}/polls`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create poll");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.polls.event(variables.eventId),
      });
    },
  });
}

export function useDeletePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tribeId,
      eventId,
      pollId,
    }: {
      tribeId: string;
      eventId: string;
      pollId: string;
    }): Promise<{ success: boolean }> => {
      const response = await fetch(
        `${API_BASE}/${tribeId}/events/${eventId}/polls/${pollId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete poll");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.polls.event(variables.eventId),
      });
    },
  });
}

export function useVotePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tribeId,
      eventId,
      pollId,
      optionIds,
    }: {
      tribeId: string;
      eventId: string;
      pollId: string;
      optionIds: string[];
    }): Promise<{ success: boolean }> => {
      const response = await fetch(
        `${API_BASE}/${tribeId}/events/${eventId}/polls/${pollId}/votes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ optionIds }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to vote");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Optimistically invalidate to refetch with new vote counts
      queryClient.invalidateQueries({
        queryKey: queryKeys.polls.event(variables.eventId),
      });
    },
  });
}

export function useRemoveVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tribeId,
      eventId,
      pollId,
      optionId,
    }: {
      tribeId: string;
      eventId: string;
      pollId: string;
      optionId?: string;
    }): Promise<{ success: boolean }> => {
      const url = new URL(
        `${API_BASE}/${tribeId}/events/${eventId}/polls/${pollId}/votes`,
        window.location.origin
      );
      if (optionId) url.searchParams.set("optionId", optionId);

      const response = await fetch(url.toString(), { method: "DELETE" });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove vote");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.polls.event(variables.eventId),
      });
    },
  });
}
