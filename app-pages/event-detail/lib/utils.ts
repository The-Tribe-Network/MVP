import type { EventWithDetails } from '@/lib/database/types'

/**
 * Transform API event data to UI format
 *
 * TODO: Implement when connecting to real API
 */
export function transformEventForUI(event: EventWithDetails) {
  // Placeholder implementation
  // Will be implemented when connecting to real API
  return event
}

/**
 * Format event date for display
 *
 * @param date - ISO date string or Date object from API
 * @returns Formatted date string (e.g., "Monday, July 15, 2024")
 */
export function formatEventDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format event time for display
 *
 * @param date - ISO date string or Date object from API
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
 * Format event time range for display
 *
 * @param startDate - Event start time
 * @param endDate - Event end time (optional)
 * @returns Formatted time range string (e.g., "6:00 PM - 10:00 PM")
 */
export function formatEventTimeRange(startDate: string | Date, endDate?: string | Date | null): string {
  const startTime = formatEventTime(startDate)
  if (!endDate) return startTime

  const endTime = formatEventTime(endDate)
  return `${startTime} - ${endTime}`
}

/**
 * Check if event is in the past
 *
 * @param eventDate - Event start date
 * @returns true if event has already occurred
 */
export function isPastEvent(eventDate: string | Date): boolean {
  const dateObj = typeof eventDate === 'string' ? new Date(eventDate) : eventDate
  return dateObj < new Date()
}

/**
 * Check if event is upcoming
 *
 * @param eventDate - Event start date
 * @returns true if event is in the future
 */
export function isUpcomingEvent(eventDate: string | Date): boolean {
  return !isPastEvent(eventDate)
}
