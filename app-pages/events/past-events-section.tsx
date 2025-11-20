'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CalendarIcon, MapPin, Users } from 'lucide-react'
import { PastEvent } from './types'

interface PastEventsSectionProps {
  events: PastEvent[]
}

export function PastEventsSection({ events }: PastEventsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Past Events</CardTitle>
        <CardDescription>Previous tribe events</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="space-y-2 pb-4 border-b last:border-0 last:pb-0">
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-sm">{event.title}</h4>
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {event.attendees}
              </Badge>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Avatar className="h-3 w-3">
                  <AvatarImage src={event.host.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{event.host.name[0]}</AvatarFallback>
                </Avatar>
                <span>{event.host.name}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

