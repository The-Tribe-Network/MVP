/**
 * Event utility functions
 *
 * Now that we're using backend types directly (EventWithDetails),
 * transformation functions are no longer needed.
 */

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
