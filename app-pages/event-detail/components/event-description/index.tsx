'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { EventWithDetails } from '@/lib/database/types'
import { EventDescriptionSkeleton } from './loading'

interface EventDescriptionProps {
  event: EventWithDetails
  isLoading?: boolean
}

/**
 * Event Description Section
 *
 * Displays the full event description
 */
export function EventDescription({ event, isLoading }: EventDescriptionProps) {
  // Loading state
  if (isLoading) return <EventDescriptionSkeleton />

  return (
    <Card>
      <CardHeader>
        <CardTitle>About this event</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
      </CardContent>
    </Card>
  )
}
