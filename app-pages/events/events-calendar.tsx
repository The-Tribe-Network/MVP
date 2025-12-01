'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface EventsCalendarProps {
  eventDates: Date[]
}

export function EventsCalendar({ eventDates }: EventsCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())

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

