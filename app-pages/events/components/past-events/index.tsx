'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CalendarIcon, MapPin, Users } from 'lucide-react'
import { PastEventsSkeleton } from './loading'
import { PastEventsError } from './error'
import { PastEventsEmpty } from './empty'
import { pastEvents } from '../../lib/mock-data'

interface PastEventsProps {
  tribeId: string
}

/**
 * Past Events Section
 *
 * Displays a list of past tribe events in a compact card format
 *
 * TODO: Replace mock data with real API integration using:
 * const { data: events, isLoading, error, isError, refetch } = useQuery(
 *   tribeEventsOptions(tribeId, { status: 'completed' })
 * )
 */
export function PastEvents({ tribeId }: PastEventsProps) {
  // Mock state management (for demonstration)
  const isLoading = false
  const isError = false
  const error = null
  const events = pastEvents // Using mock data for now

  // Loading state
  if (isLoading) return <PastEventsSkeleton />

  // Error state
  if (isError) {
    return (
      <PastEventsError
        message={error?.message}
        onRetry={() => console.log('Retry loading past events')}
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
