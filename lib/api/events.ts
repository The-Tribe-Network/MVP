import { apiFetch } from './client';

const API_BASE = '/api/tribes';

// ============================================================================
// Types
// ============================================================================

export interface Event {
  id: string;
  tribeId: string;
  title: string;
  description: string | null;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventAttendee {
  userId: string;
  eventId: string;
  status: 'going' | 'maybe' | 'not_going';
  createdAt: Date;
}

export interface CreateEventParams {
  tribeId: string;
  title: string;
  description?: string;
  location?: string;
  startDate: Date | string;
  endDate?: Date | string;
}

export interface UpdateEventParams {
  tribeId: string;
  eventId: string;
  title?: string;
  description?: string;
  location?: string;
  startDate?: Date | string;
  endDate?: Date | string;
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Fetch events for a tribe
 */
export async function fetchTribeEvents(tribeId: string): Promise<Event[]> {
  return apiFetch<Event[]>(`${API_BASE}/${tribeId}/events`);
}

/**
 * Fetch a single event by ID
 */
export async function fetchEvent(
  tribeId: string,
  eventId: string
): Promise<Event> {
  return apiFetch<Event>(`${API_BASE}/${tribeId}/events/${eventId}`);
}

/**
 * Fetch attendees for an event
 */
export async function fetchEventAttendees(
  tribeId: string,
  eventId: string
): Promise<EventAttendee[]> {
  return apiFetch<EventAttendee[]>(
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
): Promise<Event> {
  const { tribeId, ...body } = params;
  return apiFetch<Event>(
    `${API_BASE}/${tribeId}/events`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
}

/**
 * Update an event
 */
export async function updateEvent(
  params: UpdateEventParams
): Promise<Event> {
  const { tribeId, eventId, ...body } = params;
  return apiFetch<Event>(
    `${API_BASE}/${tribeId}/events/${eventId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
}

/**
 * Delete an event
 */
export async function deleteEvent(
  tribeId: string,
  eventId: string
): Promise<void> {
  return apiFetch<void>(
    `${API_BASE}/${tribeId}/events/${eventId}`,
    { method: 'DELETE' }
  );
}

/**
 * RSVP to an event
 */
export async function rsvpToEvent(
  tribeId: string,
  eventId: string,
  status: 'going' | 'maybe' | 'not_going'
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(
    `${API_BASE}/${tribeId}/events/${eventId}/rsvp`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }
  );
}
