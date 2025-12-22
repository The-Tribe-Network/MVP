'use client'

import { useState } from 'react'
import { EventCard } from './event-card'
import { UpcomingEventsSkeleton } from './loading'
import { UpcomingEventsError } from './error'
import { UpcomingEventsEmpty } from './empty'
import { allEvents } from '../../lib/mock-data'

interface UpcomingEventsProps {
  tribeId: string
}

/**
 * Upcoming Events Section
 *
 * Displays all upcoming events with voting and RSVP functionality
 *
 * TODO: Replace mock data with real API integration using:
 * const { data: events, isLoading, error, isError, refetch } = useQuery(tribeEventsOptions(tribeId))
 */
export function UpcomingEvents({ tribeId }: UpcomingEventsProps) {
  // Temporary local state for voting (will be replaced with mutations)
  const [userVotes, setUserVotes] = useState<Record<number, number>>({
    2: 1, // User voted for option 1 in event 2
  })

  // Mock state management (for demonstration)
  const isLoading = false
  const isError = false
  const error = null
  const events = allEvents // Using mock data for now

  const handleVote = (eventId: number, optionId: number) => {
    setUserVotes(prev => ({
      ...prev,
      [eventId]: optionId
    }))
    console.log(`Voted for option ${optionId} in event ${eventId}`)
  }

  // Loading state
  if (isLoading) return <UpcomingEventsSkeleton />

  // Error state
  if (isError) {
    return (
      <UpcomingEventsError
        message={error?.message}
        onRetry={() => console.log('Retry loading events')}
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
      <h2 className="text-2xl font-semibold">All Events & Votes</h2>

      {events.map((event) => {
        const hasUserVoted = userVotes[event.id] !== undefined
        const userVotedOption = userVotes[event.id]

        return (
          <EventCard
            key={event.id}
            event={event}
            tribeId={tribeId}
            hasUserVoted={hasUserVoted}
            userVotedOption={userVotedOption}
            onVote={handleVote}
          />
        )
      })}
    </div>
  )
}
