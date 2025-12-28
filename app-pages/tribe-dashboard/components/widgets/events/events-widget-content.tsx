'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
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
      <div className="space-y-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground mb-2">Failed to load events</p>
        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  // Empty state (no events)
  if (!events || events.length === 0) {
    return (
      <div className="py-2">
        <p className="text-xs text-muted-foreground mb-3">No upcoming events</p>
        <Button variant="ghost" size="sm" className="text-xs h-7 px-2" asChild>
          <Link href={`/tribe/${tribeId}/events/new`}>
            <Plus className="h-3 w-3 mr-1" />
            Create Event
          </Link>
        </Button>
      </div>
    )
  }

  // Data state (events available)
  return (
    <div className="space-y-2">
      {events.map((event) => (
        <EventPreviewItem key={event.id} event={event} />
      ))}
    </div>
  )
}
