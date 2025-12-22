'use client'

import { EventCard } from './event-card'
import { allEvents as events } from './lib/mock-data'

// Local UI types for event page - see event-card.tsx for full Event interface
interface Host {
  name: string
  avatar: string
}

interface VoteOption {
  id: number
  title: string
  votes: number
}

interface Event {
  id: number
  title: string
  date: string
  time: string
  location: string
  attendees: number
  description: string
  host: Host
  status: 'confirmed' | 'voting'
  hasVote?: boolean
  isAttending?: boolean
  voteDeadline?: string
  voteOptions?: VoteOption[]
}

interface EventsListProps {
  userVotes: Record<number, number>
  onVote: (eventId: number, optionId: number) => void
}

export function EventsList({ userVotes, onVote }: EventsListProps) {
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

