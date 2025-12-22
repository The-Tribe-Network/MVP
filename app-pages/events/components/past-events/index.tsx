'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CalendarIcon, MapPin, Users } from 'lucide-react'
import { format } from 'date-fns'
import { PastEventsSkeleton } from './loading'
import { PastEventsError } from './error'
import { PastEventsEmpty } from './empty'
import { useTribeEvents } from '@/lib/hooks/use-events'

interface PastEventsProps {
  tribeId: string
}

/**
 * Past Events Section
 *
 * Displays a list of past tribe events in a compact card format.
 * Shows up to 5 most recent completed events.
 */
export function PastEvents({ tribeId }: PastEventsProps) {
  // Fetch completed events
  const { data: allEvents, isLoading, error, isError, refetch } = useTribeEvents(tribeId, {
    status: 'completed'
  })

  // Limit to 5 most recent past events
  const events = allEvents?.slice(0, 5)

  // Loading state
  if (isLoading) return <PastEventsSkeleton />

  // Error state
  if (isError) {
    return (
      <PastEventsError
        message={error?.message || 'Failed to load past events'}
        onRetry={refetch}
      />
    )
  }

  // Empty state
  if (!events || events.length === 0) {
    return <PastEventsEmpty />
  }

  // Success state
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
                {event.attendeeCount || 0}
              </Badge>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                <span>{format(new Date(event.startDate), 'PPP')}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{event.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Avatar className="h-3 w-3">
                  <AvatarImage src={event.creator.image || "/placeholder.svg"} />
                  <AvatarFallback>{event.creator.name[0]}</AvatarFallback>
                </Avatar>
                <span>{event.creator.name}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
