import type { EventWithCreator, EventWithDetails } from '@/lib/database/types'
import type { Event, PastEvent } from './types'

/**
 * Transform API event data to UI event format
 *
 * TODO: Implement when connecting to real API
 * This will convert EventWithCreator from the database to Event type for the UI
 */
export function transformEventForUI(event: EventWithCreator): Event {
  // Placeholder implementation
  // Will be implemented when connecting to real API
  return {
    id: 0,
    title: '',
    date: '',
    time: '',
    location: '',
    attendees: 0,
    description: '',
    host: { name: '', avatar: '' },
    status: 'confirmed',
  }
}

/**
 * Transform array of API events to UI events
 *
 * TODO: Implement when connecting to real API
 */
export function transformEventsForUI(events: EventWithCreator[]): Event[] {
  return events.map(transformEventForUI)
}

/**
 * Transform API event data to UI past event format
 *
 * TODO: Implement when connecting to real API
 */
export function transformPastEventForUI(event: EventWithCreator): PastEvent {
  // Placeholder implementation
  return {
    id: 0,
    title: '',
    date: '',
    time: '',
    location: '',
    attendees: 0,
    description: '',
    host: { name: '', avatar: '' },
  }
}

/**
 * Extract event dates for calendar highlighting
 *
 * TODO: Implement when connecting to real API
 * This will extract Date objects from events for calendar highlighting
 */
export function extractEventDates(events: EventWithCreator[]): Date[] {
  // Placeholder implementation
  // Will parse event.startDate and return array of Date objects
  return []
}

/**
 * Format event date for display
 *
 * @param date - ISO date string from API
 * @returns Formatted date string (e.g., "July 15, 2024")
 */
export function formatEventDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format event time for display
 *
 * @param date - ISO date string from API
 * @returns Formatted time string (e.g., "6:00 PM")
 */
export function formatEventTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Check if an event is upcoming
 *
 * @param eventDate - Event start date
 * @returns true if event is in the future
 */
export function isUpcomingEvent(eventDate: string | Date): boolean {
  const dateObj = typeof eventDate === 'string' ? new Date(eventDate) : eventDate
  return dateObj > new Date()
}

/**
 * Sort events by date (ascending)
 *
 * @param events - Array of events
 * @returns Sorted array of events
 */
export function sortEventsByDate<T extends { date: string }>(events: T[]): T[] {
  return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}
