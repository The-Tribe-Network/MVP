import { queryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { fetchTribeEvents, fetchEvent, fetchEventAttendees } from '@/lib/api/events';

// ============================================================================
// Query Options
// ============================================================================

/**
 * Query options for fetching tribe events
 */
export function tribeEventsOptions(tribeId: string) {
  return queryOptions({
    queryKey: queryKeys.events.tribe(tribeId),
    queryFn: () => fetchTribeEvents(tribeId),
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
