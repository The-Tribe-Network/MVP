'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { EventWithDetails } from '@/lib/database/types'

interface EventWidgetProps {
  events: EventWithDetails[]
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
        {events.map((event) => {
          const eventDate = new Date(event.startDate)
          const formattedDate = eventDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })
          const formattedTime = eventDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
          })

          return (
            <div
              key={event.id}
              className="p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors space-y-2"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-sm">{event.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {event.attendeeCount} going
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formattedTime}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{event.location || 'TBD'}</span>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

