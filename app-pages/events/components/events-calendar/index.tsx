'use client'

import { useState, useMemo } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EventsCalendarSkeleton } from './loading'
import { useTribeEvents } from '@/lib/hooks/use-events'

interface EventsCalendarProps {
  tribeId: string
}

/**
 * Events Calendar Section
 *
 * Displays a calendar with highlighted dates that have events.
 * Fetches upcoming events and marks their start dates on the calendar.
 */
export function EventsCalendar({ tribeId }: EventsCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Fetch upcoming events to get event dates
  const { data: events, isLoading } = useTribeEvents(tribeId, { status: 'upcoming' })

  // Extract event dates for calendar highlighting
  const eventDates = useMemo(() => {
    if (!events) return []
    return events.map(event => new Date(event.startDate))
  }, [events])

  // Loading state
  if (isLoading) return <EventsCalendarSkeleton />

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
        <CardDescription>Events are highlighted</CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md"
          modifiers={{
            event: eventDates,
          }}
          modifiersClassNames={{
            event: 'bg-primary/20 text-primary font-bold',
          }}
        />
      </CardContent>
    </Card>
  )
}
