'use client'

import { EventCard } from './event-card'
import { UpcomingEventsSkeleton } from './loading'
import { UpcomingEventsError } from './error'
import { UpcomingEventsEmpty } from './empty'
import { useTribeEvents } from '@/lib/hooks/use-events'

interface UpcomingEventsProps {
  tribeId: string
}

/**
 * Upcoming Events Section
 *
 * Displays all upcoming and ongoing events with RSVP functionality.
 * Events are fetched from the backend using TanStack Query.
 */
export function UpcomingEvents({ tribeId }: UpcomingEventsProps) {
  // Fetch upcoming and ongoing events
  const { data: events, isLoading, error, isError, refetch } = useTribeEvents(tribeId, {
    status: 'upcoming'
  })

  // Loading state
  if (isLoading) return <UpcomingEventsSkeleton />

  // Error state
  if (isError) {
    return (
      <UpcomingEventsError
        message={error?.message || 'Failed to load events'}
        onRetry={refetch}
      />
    )
  }

  // Empty state
  if (!events || events.length === 0) {
    return <UpcomingEventsEmpty tribeId={tribeId} />
  }

  // Success state
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Upcoming Events</h2>

      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          tribeId={tribeId}
        />
      ))}
    </div>
  )
}
