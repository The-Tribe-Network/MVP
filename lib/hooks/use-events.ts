"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/constants/query-keys";
import { tribeEventsOptions, eventDetailOptions, eventAttendeesOptions } from "@/lib/query-options/events";
import type { EventWithDetails } from "@/lib/database/types";
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
  options?: { 
    status?: "upcoming" | "ongoing" | "completed" | "cancelled";
    limit?: number;
  }
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
 * Fetch attendees for an event
 */
export function useEventAttendees(tribeId: string, eventId: string) {
  return useQuery(eventAttendeesOptions(tribeId, eventId));
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
    onMutate: async (variables) => {
      // Cancel outgoing queries to prevent overwriting optimistic update
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: queryKeys.events.tribe(variables.tribeId),
        }),
        queryClient.cancelQueries({
          queryKey: queryKeys.events.detail(variables.eventId),
        }),
      ]);

      // Snapshot previous values for rollback
      const previousEvents = queryClient.getQueryData(
        queryKeys.events.tribe(variables.tribeId)
      );
      const previousEventDetail = queryClient.getQueryData(
        queryKeys.events.detail(variables.eventId)
      );

      // Optimistically update tribe events list cache
      queryClient.setQueryData(
        queryKeys.events.tribe(variables.tribeId),
        (old: typeof previousEvents) => {
          if (!old || !Array.isArray(old)) return old;
          return old.map((event) =>
            event.id === variables.eventId
              ? {
                  ...event,
                  isUserAttending: true,
                  attendeeCount: (event.attendeeCount || 0) + 1,
                }
              : event
          );
        }
      );

      // Optimistically update event detail cache
      queryClient.setQueryData(
        queryKeys.events.detail(variables.eventId),
        (old: EventWithDetails | undefined) => {
          if (!old) return old;
          return {
            ...old,
            isUserAttending: true,
            attendeeCount: (old.attendeeCount || 0) + 1,
          };
        }
      );

      return { previousEvents, previousEventDetail };
    },
    onError: (_, variables, context) => {
      // Rollback on error
      if (context?.previousEvents) {
        queryClient.setQueryData(
          queryKeys.events.tribe(variables.tribeId),
          context.previousEvents
        );
      }
      if (context?.previousEventDetail) {
        queryClient.setQueryData(
          queryKeys.events.detail(variables.eventId),
          context.previousEventDetail
        );
      }
    },
    onSuccess: (_, variables) => {
      // Don't invalidate queries we optimistically updated - they already have correct data
      // Only invalidate related queries that we didn't update
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.attendees(variables.eventId),
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
    onMutate: async (variables) => {
      // Cancel outgoing queries to prevent overwriting optimistic update
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: queryKeys.events.tribe(variables.tribeId),
        }),
        queryClient.cancelQueries({
          queryKey: queryKeys.events.detail(variables.eventId),
        }),
      ]);

      // Snapshot previous values for rollback
      const previousEvents = queryClient.getQueryData(
        queryKeys.events.tribe(variables.tribeId)
      );
      const previousEventDetail = queryClient.getQueryData(
        queryKeys.events.detail(variables.eventId)
      );

      // Optimistically update tribe events list cache
      queryClient.setQueryData(
        queryKeys.events.tribe(variables.tribeId),
        (old: typeof previousEvents) => {
          if (!old || !Array.isArray(old)) return old;
          return old.map((event) =>
            event.id === variables.eventId
              ? {
                  ...event,
                  isUserAttending: false,
                  attendeeCount: Math.max((event.attendeeCount || 0) - 1, 0),
                }
              : event
          );
        }
      );

      // Optimistically update event detail cache
      queryClient.setQueryData(
        queryKeys.events.detail(variables.eventId),
        (old: EventWithDetails | undefined) => {
          if (!old) return old;
          return {
            ...old,
            isUserAttending: false,
            attendeeCount: Math.max((old.attendeeCount || 0) - 1, 0),
          };
        }
      );

      return { previousEvents, previousEventDetail };
    },
    onError: (_, variables, context) => {
      // Rollback on error
      if (context?.previousEvents) {
        queryClient.setQueryData(
          queryKeys.events.tribe(variables.tribeId),
          context.previousEvents
        );
      }
      if (context?.previousEventDetail) {
        queryClient.setQueryData(
          queryKeys.events.detail(variables.eventId),
          context.previousEventDetail
        );
      }
    },
    onSuccess: (_, variables) => {
      // Don't invalidate queries we optimistically updated - they already have correct data
      // Only invalidate related queries that we didn't update
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.attendees(variables.eventId),
      });
    },
  });
}
