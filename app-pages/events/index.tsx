'use client'

import { useState } from 'react'
import { EventsHeader } from './events-header'
import { EventsList } from './events-list'
import { EventsCalendar } from './events-calendar'
import { PastEventsSection } from './past-events-section'
import { pastEvents } from './lib/mock-data'

interface EventsPageProps {
  tribeId: string;
}

export default function EventsPage({ tribeId }: EventsPageProps) {
  const [userVotes, setUserVotes] = useState<Record<number, number>>({
    2: 1, // User voted for option 1 in event 2
  })

  // Dates with events for calendar highlighting
  const eventDates = [
    new Date(2024, 6, 15),
    new Date(2024, 6, 20),
    new Date(2024, 6, 22),
    new Date(2024, 6, 28),
  ]

  const handleVote = (eventId: number, optionId: number) => {
    setUserVotes(prev => ({
      ...prev,
      [eventId]: optionId
    }))
    console.log(`Voted for option ${optionId} in event ${eventId}`)
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <EventsHeader tribeId={tribeId} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <EventsList
                userVotes={userVotes}
                onVote={handleVote}
              />
            </div>

            <div className="lg:col-span-1 space-y-6">
              <EventsCalendar eventDates={eventDates} />
              <PastEventsSection tribeId={tribeId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
