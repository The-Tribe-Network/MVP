'use client'

import { useState } from 'react'
import { EventsHeader } from './events-header'
import { EventsList } from './events-list'
import { EventsCalendar } from './events-calendar'
import { PastEventsSection } from './past-events-section'
import { Event, PastEvent } from './types'

interface EventsPageProps {
  tribeId: string;
}
export default function EventsPage({ tribeId }: EventsPageProps) {
  const [userVotes, setUserVotes] = useState<Record<number, number>>({
    2: 1, // User voted for option 1 in event 2
  })

  const allEvents: Event[] = [
    {
      id: 1,
      title: 'Summer BBQ Party',
      date: '2024-07-15',
      time: '6:00 PM',
      location: 'Central Park',
      attendees: 24,
      description: 'Join us for a fun summer BBQ with great food and games!',
      host: { name: 'Sarah Chen', avatar: '/placeholder.svg?height=40&width=40' },
      status: 'confirmed',
      hasVote: false,
      isAttending: true,
    },
    {
      id: 2,
      title: 'Movie Night - Vote for Movie!',
      date: '2024-07-20',
      time: '8:00 PM',
      location: "Jake's Place",
      attendees: 18,
      description: 'Vote for which movie we should watch this Friday!',
      host: { name: 'Jake Miller', avatar: '/placeholder.svg?height=40&width=40' },
      status: 'voting',
      hasVote: true,
      isAttending: false,
      voteDeadline: '2024-07-18',
      voteOptions: [
        { id: 1, title: 'Inception', votes: 12 },
        { id: 2, title: 'The Dark Knight', votes: 8 },
        { id: 3, title: 'Interstellar', votes: 6 },
      ],
    },
    {
      id: 3,
      title: 'Weekend Hiking Trip',
      date: '2024-07-22',
      time: '7:00 AM',
      location: 'Mountain Trail',
      attendees: 15,
      description: 'Early morning hike to catch the sunrise. Bring water and snacks!',
      host: { name: 'Alex Johnson', avatar: '/placeholder.svg?height=40&width=40' },
      status: 'confirmed',
      hasVote: false,
      isAttending: false,
    },
    {
      id: 4,
      title: 'Game Night - Choose Location',
      date: '2024-07-28',
      time: '7:30 PM',
      location: 'TBD',
      attendees: 20,
      description: 'Vote for where we should host game night this month!',
      host: { name: 'Emily Davis', avatar: '/placeholder.svg?height=40&width=40' },
      status: 'voting',
      hasVote: true,
      isAttending: true,
      voteDeadline: '2024-07-25',
      voteOptions: [
        { id: 1, title: "Mike's House", votes: 10 },
        { id: 2, title: "Community Center", votes: 15 },
        { id: 3, title: "Sarah's Apartment", votes: 5 },
      ],
    },
  ]

  const pastEvents: PastEvent[] = [
    {
      id: 5,
      title: 'Spring Picnic',
      date: '2024-06-10',
      time: '2:00 PM',
      location: 'Riverside Park',
      attendees: 32,
      description: 'Beautiful spring picnic with games and food.',
      host: { name: 'Mike Wilson', avatar: '/placeholder.svg?height=40&width=40' },
    },
    {
      id: 6,
      title: 'Board Game Tournament',
      date: '2024-06-05',
      time: '6:00 PM',
      location: 'Community Center',
      attendees: 28,
      description: 'Epic board game competition!',
      host: { name: 'Lisa Brown', avatar: '/placeholder.svg?height=40&width=40' },
    },
    {
      id: 7,
      title: 'Beach Volleyball',
      date: '2024-05-28',
      time: '4:00 PM',
      location: 'Sunset Beach',
      attendees: 20,
      description: 'Friendly volleyball matches by the beach.',
      host: { name: 'Chris Lee', avatar: '/placeholder.svg?height=40&width=40' },
    },
  ]

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
                events={allEvents}
                userVotes={userVotes}
                onVote={handleVote}
              />
            </div>

            <div className="lg:col-span-1 space-y-6">
              <EventsCalendar eventDates={eventDates} />
              <PastEventsSection events={pastEvents} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
