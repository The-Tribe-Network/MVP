"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EventWithCreator, EventWithDetails } from "@/lib/database/types";
import { queryKeys } from "@/lib/constants/query-keys";

const API_BASE = "/api/tribes";

type CreateEventInput = {
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  poll?: {
    question: string;
    options: string[];
    allowMultiple: boolean;
    isAnonymous: boolean;
  } | null;
};

export function useTribeEvents(
  tribeId: string,
  options?: { status?: "upcoming" | "ongoing" | "completed" | "cancelled" }
) {
  return useQuery<EventWithCreator[]>({
    queryKey: queryKeys.events.tribe(tribeId),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.status) params.set("status", options.status);

      const response = await fetch(
        `${API_BASE}/${tribeId}/events${
          params.toString() ? `?${params.toString()}` : ""
        }`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch events");
      }

      return response.json();
    },
  });
}

export function useEventDetail(tribeId: string, eventId: string) {
  return useQuery<EventWithDetails>({
    queryKey: queryKeys.events.detail(eventId),
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/${tribeId}/events/${eventId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch event");
      }

      return response.json();
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tribeId,
      data,
    }: {
      tribeId: string;
      data: CreateEventInput;
    }): Promise<EventWithCreator> => {
      const response = await fetch(`${API_BASE}/${tribeId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create event");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.tribe(variables.tribeId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.activities.tribe(variables.tribeId),
      });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tribeId,
      eventId,
      data,
    }: {
      tribeId: string;
      eventId: string;
      data: Partial<CreateEventInput>;
    }): Promise<EventWithCreator> => {
      const response = await fetch(
        `${API_BASE}/${tribeId}/events/${eventId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update event");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.tribe(variables.tribeId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.detail(variables.eventId),
      });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tribeId,
      eventId,
    }: {
      tribeId: string;
      eventId: string;
    }): Promise<{ success: boolean }> => {
      const response = await fetch(
        `${API_BASE}/${tribeId}/events/${eventId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete event");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.tribe(variables.tribeId),
      });
    },
  });
}

export function useAddEventAttendee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tribeId,
      eventId,
      status,
    }: {
      tribeId: string;
      eventId: string;
      status?: "going" | "maybe" | "not_going";
    }): Promise<{ success: boolean }> => {
      const response = await fetch(
        `${API_BASE}/${tribeId}/events/${eventId}/attendees`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: status || "going" }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to RSVP");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.detail(variables.eventId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.activities.tribe(variables.tribeId),
      });
    },
  });
}

export function useRemoveEventAttendee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tribeId,
      eventId,
    }: {
      tribeId: string;
      eventId: string;
    }): Promise<{ success: boolean }> => {
      const response = await fetch(
        `${API_BASE}/${tribeId}/events/${eventId}/attendees`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove RSVP");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.detail(variables.eventId),
      });
    },
  });
}
