import { apiFetch, buildQueryString } from './client';
import type { EventWithCreator, EventWithDetails, EventAttendeeWithUser } from '@/lib/database/types';

const API_BASE = '/api/tribes';

// ============================================================================
// Types
// ============================================================================

export interface CreateEventInput {
  title: string;
  description?: string | null;
  startDate: Date;
  endDate?: Date | null;
  location?: string | null;
  coverImageUrl?: string | null;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  poll?: {
    question: string;
    options: string[];
    allowMultiple: boolean;
    isAnonymous: boolean;
    endsAt?: Date;
  } | null;
}

export interface CreateEventParams {
  tribeId: string;
  data: CreateEventInput;
}

export interface UpdateEventParams {
  tribeId: string;
  eventId: string;
  data: Partial<CreateEventInput>;
}

export interface DeleteEventParams {
  tribeId: string;
  eventId: string;
}

export interface AddEventAttendeeParams {
  tribeId: string;
  eventId: string;
  status?: 'going' | 'maybe' | 'not_going';
}

export interface RemoveEventAttendeeParams {
  tribeId: string;
  eventId: string;
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Fetch events for a tribe
 */
export async function fetchTribeEvents(
  tribeId: string,
  options?: { 
    status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    limit?: number;
  }
): Promise<EventWithDetails[]> {
  const queryString = buildQueryString(options || {});
  return apiFetch<EventWithDetails[]>(
    `${API_BASE}/${tribeId}/events${queryString}`
  );
}

/**
 * Fetch a single event by ID
 */
export async function fetchEvent(
  tribeId: string,
  eventId: string
): Promise<EventWithDetails> {
  return apiFetch<EventWithDetails>(
    `${API_BASE}/${tribeId}/events/${eventId}`
  );
}

/**
 * Fetch attendees for an event
 */
export async function fetchEventAttendees(
  tribeId: string,
  eventId: string
): Promise<EventAttendeeWithUser[]> {
  return apiFetch<EventAttendeeWithUser[]>(
    `${API_BASE}/${tribeId}/events/${eventId}/attendees`
  );
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Create a new event
 */
export async function createEvent(
  params: CreateEventParams
): Promise<EventWithCreator> {
  const { tribeId, data } = params;
  return apiFetch<EventWithCreator>(
    `${API_BASE}/${tribeId}/events`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
}

/**
 * Update an event
 */
export async function updateEvent(
  params: UpdateEventParams
): Promise<EventWithCreator> {
  const { tribeId, eventId, data } = params;
  return apiFetch<EventWithCreator>(
    `${API_BASE}/${tribeId}/events/${eventId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
}

/**
 * Delete an event
 */
export async function deleteEvent(
  params: DeleteEventParams
): Promise<{ success: boolean }> {
  const { tribeId, eventId } = params;
  return apiFetch<{ success: boolean }>(
    `${API_BASE}/${tribeId}/events/${eventId}`,
    { method: 'DELETE' }
  );
}

/**
 * Add event attendee (RSVP)
 */
export async function addEventAttendee(
  params: AddEventAttendeeParams
): Promise<{ success: boolean }> {
  const { tribeId, eventId, status } = params;
  return apiFetch<{ success: boolean }>(
    `${API_BASE}/${tribeId}/events/${eventId}/attendees`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: status || 'going' }),
    }
  );
}

/**
 * Remove event attendee (remove RSVP)
 */
export async function removeEventAttendee(
  params: RemoveEventAttendeeParams
): Promise<{ success: boolean }> {
  const { tribeId, eventId } = params;
  return apiFetch<{ success: boolean }>(
    `${API_BASE}/${tribeId}/events/${eventId}/attendees`,
    { method: 'DELETE' }
  );
}
