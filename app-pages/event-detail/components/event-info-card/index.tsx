'use client'

import { Card, CardContent } from '@/components/ui/card'
import { CalendarIcon, Clock, MapPin, Users } from 'lucide-react'
import type { EventWithDetails } from '@/lib/database/types'
import { formatEventDate, formatEventTimeRange } from '../../lib/utils'
import { EventInfoCardSkeleton } from './loading'

interface EventInfoCardProps {
  event: EventWithDetails | undefined
  isLoading?: boolean
}

/**
 * Event Info Card Section
 *
 * Displays quick event information: date, time, location, attendee count
 */
export function EventInfoCard({ event, isLoading }: EventInfoCardProps) {
  // Loading state
  if (isLoading) return <EventInfoCardSkeleton />

  if (!event) return null

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Date</p>
              <p className="text-sm text-muted-foreground">{formatEventDate(event.startDate)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Time</p>
              <p className="text-sm text-muted-foreground">
                {formatEventTimeRange(event.startDate, event.endDate)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Location</p>
              <p className="text-sm text-muted-foreground">{event.location}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Attendees</p>
              <p className="text-sm text-muted-foreground">{event.attendeeCount} people attending</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
