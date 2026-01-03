'use client'

import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'
import { format } from 'date-fns'
import type { DemoEvent } from '../../types'

interface DemoEventsWidgetProps {
  events: DemoEvent[]
}

export function DemoEventsWidget({ events }: DemoEventsWidgetProps) {
  // Only show first 2 events
  const displayEvents = events.slice(0, 2)

  return (
    <div className="space-y-3">
      <Separator className="mx-4" />

      {/* Header */}
      <div className="flex items-center gap-2 px-4">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Upcoming Events
        </h3>
      </div>

      {/* Events list */}
      <div className="space-y-2 px-4">
        {displayEvents.map((event) => (
          <div
            key={event.id}
            className="p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium truncate flex-1">{event.title}</h4>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0">
                <Users className="h-2.5 w-2.5 mr-1" />
                {event.attendeeCount}
              </Badge>
            </div>

            <div className="mt-1.5 space-y-0.5">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Clock className="h-2.5 w-2.5" />
                <span>{format(event.startDate, 'EEE, MMM d')} at {format(event.startDate, 'h:mm a')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
