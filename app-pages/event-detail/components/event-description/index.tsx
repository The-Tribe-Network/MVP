'use client'

import type { EventWithDetails } from '@/lib/database/types'
import { EventDescriptionSkeleton } from './loading'

interface EventDescriptionProps {
  event: EventWithDetails | undefined
  isLoading?: boolean
}

/**
 * Event Description Section
 *
 * Displays the full event description without card wrapper
 */
export function EventDescription({ event, isLoading }: EventDescriptionProps) {
  // Loading state
  if (isLoading) return <EventDescriptionSkeleton />

  if (!event || !event.description) return null

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
        {event.description}
      </p>
    </div>
  )
}
