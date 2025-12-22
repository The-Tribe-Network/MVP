/**
 * Event Types - Using Backend Types
 *
 * This file re-exports backend types and extends them with UI-specific properties.
 * The backend types (EventWithCreator, EventWithDetails) come from the database layer.
 */

import type { EventWithCreator, EventWithDetails } from '@/lib/database/types'

// Re-export backend types for component use
export type { EventWithCreator, EventWithDetails }

/**
 * Extended event type with UI-specific computed properties
 * This is used for the events list display
 */
export type EventListItem = EventWithDetails & {
  // UI computed properties can be added here if needed
  // For example: formattedDate, isUpcoming, etc.
}