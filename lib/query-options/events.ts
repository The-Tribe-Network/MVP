import { queryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { fetchTribeEvents, fetchEvent, fetchEventAttendees } from '@/lib/api/events';

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching tribe events
 */
export function tribeEventsOptions(
  tribeId: string,
  options?: { 
    status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    limit?: number;
  }
) {
  // Normalize options to prevent cache fragmentation (remove undefined values)
  const normalizedOptions = options
    ? (Object.fromEntries(
        Object.entries(options).filter(([_, v]) => v !== undefined)
      ) as Record<string, unknown>)
    : undefined;

  // Only include filters in query key if there are actual values
  const queryKey = normalizedOptions && Object.keys(normalizedOptions).length > 0
    ? queryKeys.events.tribe(tribeId, normalizedOptions)
    : queryKeys.events.tribe(tribeId);

  return queryOptions({
    queryKey,
    queryFn: () => fetchTribeEvents(tribeId, options),
  });
}

/**
 * Query options for fetching a single event
 */
export function eventDetailOptions(tribeId: string, eventId: string) {
  return queryOptions({
    queryKey: queryKeys.events.detail(eventId),
    queryFn: () => fetchEvent(tribeId, eventId),
  });
}

/**
 * Query options for fetching event attendees
 */
export function eventAttendeesOptions(tribeId: string, eventId: string) {
  return queryOptions({
    queryKey: queryKeys.events.attendees(eventId),
    queryFn: () => fetchEventAttendees(tribeId, eventId),
  });
}
