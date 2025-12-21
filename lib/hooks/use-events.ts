"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import { tribeEventsOptions, eventDetailOptions } from "@/lib/query-options/events";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  addEventAttendee,
  removeEventAttendee,
  type CreateEventInput,
  type CreateEventParams,
  type UpdateEventParams,
  type DeleteEventParams,
  type AddEventAttendeeParams,
  type RemoveEventAttendeeParams,
} from "@/lib/api/events";

// Re-export types for backwards compatibility
export type { CreateEventInput };

/**
 * Fetch events for a tribe
 */
export function useTribeEvents(
  tribeId: string,
  options?: { status?: "upcoming" | "ongoing" | "completed" | "cancelled" }
) {
  return useQuery(tribeEventsOptions(tribeId, options));
}

/**
 * Fetch a single event by ID
 */
export function useEventDetail(tribeId: string, eventId: string) {
  return useQuery(eventDetailOptions(tribeId, eventId));
}

/**
 * Create a new event
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateEventParams) => createEvent(params),
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

/**
 * Update an event
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateEventParams) => updateEvent(params),
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

/**
 * Delete an event
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteEventParams) => deleteEvent(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.tribe(variables.tribeId),
      });
    },
  });
}

/**
 * Add event attendee (RSVP)
 */
export function useAddEventAttendee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: AddEventAttendeeParams) => addEventAttendee(params),
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

/**
 * Remove event attendee (remove RSVP)
 */
export function useRemoveEventAttendee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: RemoveEventAttendeeParams) => removeEventAttendee(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.detail(variables.eventId),
      });
    },
  });
}
