'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  attendees: number
}

interface EventWidgetProps {
  events: Event[]
  tribeId: string
};

export default function EventsWidget({ events, tribeId }: EventWidgetProps) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Upcoming Events
        </CardTitle>

        <Link href={`/tribe/${tribeId}/events`} className="flex items-center">
          <Button variant="ghost" size="sm" className="h-auto p-0 hover:text-primary/80 hover:cursor-pointer space-x-2">
            View all
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors space-y-2"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-sm">{event.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {event.attendees} going
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export const eventsWidgetMockData: Event[] = [
  {
    id: '1',
    title: 'Beach Cleanup',
    date: 'Sat, Jun 15',
    time: '9:00 AM',
    location: 'Sunset Beach',
    attendees: 12
  },
  {
    id: '2',
    title: 'Movie Night',
    date: 'Fri, Jun 21',
    time: '7:00 PM',
    location: "Alex's Place",
    attendees: 8
  },
  {
    id: '3',
    title: 'Hiking Trip',
    date: 'Sun, Jun 23',
    time: '6:00 AM',
    location: 'Mountain Trail',
    attendees: 15
  }
];