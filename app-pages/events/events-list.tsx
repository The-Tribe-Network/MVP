'use client'

import { Event } from './types'
import { EventCard } from './event-card'

interface EventsListProps {
  events: Event[]
  userVotes: Record<number, number>
  onVote: (eventId: number, optionId: number) => void
}

export function EventsList({ events, userVotes, onVote }: EventsListProps) {
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
            hasUserVoted={hasUserVoted}
            userVotedOption={userVotedOption}
            onVote={onVote}
          />
        )
      })}
    </div>
  )
}

