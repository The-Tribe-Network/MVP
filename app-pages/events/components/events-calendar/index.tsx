'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EventsCalendarSkeleton } from './loading'

interface EventsCalendarProps {
  tribeId: string
  eventDates?: Date[]
}

/**
 * Events Calendar Section
 *
 * Displays a calendar with highlighted dates that have events
 *
 * TODO: Replace eventDates prop with real data from API:
 * const { data: events } = useQuery(tribeEventsOptions(tribeId))
 * const eventDates = useMemo(() => events?.map(e => new Date(e.startDate)), [events])
 */
export function EventsCalendar({ tribeId, eventDates = [] }: EventsCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Mock loading state (for demonstration)
  const isLoading = false

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
