'use client'

import { useState, useMemo } from 'react'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useTribeEvents } from '@/lib/hooks/use-events'
import { EventCard } from './event-card'

interface EventsGridProps {
  tribeId: string
}

type FilterType = 'all' | 'upcoming' | 'past'

export function EventsGrid({ tribeId }: EventsGridProps) {
  const [filter, setFilter] = useState<FilterType>('all')

  const { data: events, isLoading } = useTribeEvents(tribeId)

  const filteredEvents = useMemo(() => {
    if (!events) return []

    if (filter === 'all') return events
    if (filter === 'upcoming') {
      return events.filter(e => e.status === 'upcoming' || e.status === 'ongoing')
    }
    // past: completed or cancelled
    return events.filter(e => e.status === 'completed' || e.status === 'cancelled')
  }, [events, filter])

  if (isLoading) {
    return <EventsGridSkeleton />
  }

  return (
    <div>
      {/* Filter Controls */}
      <div className="mb-8 flex items-center gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'upcoming' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </Button>
        <Button
          variant={filter === 'past' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('past')}
        >
          Past
        </Button>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} tribeId={tribeId} />
          ))}
        </div>
      ) : (
        <EmptyState filter={filter} />
      )}
    </div>
  )
}

function EmptyState({ filter }: { filter: FilterType }) {
  const messages = {
    all: { title: 'No events yet', description: 'Create an event to get started.' },
    upcoming: { title: 'No upcoming events', description: 'All caught up! Create an event to plan your next gathering.' },
    past: { title: 'No past events', description: 'Events that have ended will appear here.' },
  }

  const { title, description } = messages[filter]

  return (
    <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
      <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function EventsGridSkeleton() {
  return (
    <div>
      {/* Filter Skeleton */}
      <div className="mb-8 flex items-center gap-2">
        <Skeleton className="h-9 w-14" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-16" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-lg border border-border overflow-hidden">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
