'use client'

import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Plus, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useTribeEvents } from '@/lib/hooks/use-events'
import EventPreviewItem from './event-preview-item'

interface EventsWidgetContentProps {
  tribeId: string
}

export default function EventsWidgetContent({ tribeId }: EventsWidgetContentProps) {
  const { data: events, isLoading, error, refetch } = useTribeEvents(tribeId, {
    status: 'upcoming',
    limit: 4
  })
  // Loading state
  if (isLoading) {
    return (
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </CardContent>
    )
  }

  // Error state
  if (error) {
    return (
      <CardContent>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Failed to load events</EmptyTitle>
            <EmptyDescription>
              {error.message || 'An error occurred while loading events'}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <AlertCircle className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </EmptyContent>
        </Empty>
      </CardContent>
    )
  }

  // Empty state (no events)
  if (!events || events.length === 0) {
    return (
      <CardContent>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No upcoming events</EmptyTitle>
            <EmptyDescription>
              Things seem to be quiet, shake things up by creating an event!
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" size="sm" className="hover:bg-accent hover:text-accent-foreground" asChild>
              <Link href={`/tribe/${tribeId}/events/new`}>
                <Plus className="size-4 mr-2" />
                New Event
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </CardContent>
    )
  }

  // Data state (events available)
  return (
    <CardContent className="space-y-4">
      {events.map((event) => (
        <EventPreviewItem key={event.id} event={event} />
      ))}
    </CardContent>
  )
}
