'use client'

import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { EventWithDetails } from '@/lib/database/types'

interface EventTitleSectionProps {
  event: EventWithDetails | undefined
  isLoading?: boolean
}

export function EventTitleSection({ event, isLoading }: EventTitleSectionProps) {
  if (isLoading) {
    return <EventTitleSectionSkeleton />
  }

  if (!event) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-3xl font-bold">{event.title}</h1>
        <Badge variant="secondary" className="bg-green-500/10 text-green-500">
          {event.status}
        </Badge>
        {event.isUserAttending && (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Attending
          </Badge>
        )}
      </div>
      <p className="text-muted-foreground">
        Hosted by <span className="text-foreground font-medium">{event.creator.name}</span>
      </p>
    </div>
  )
}

function EventTitleSectionSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-5 w-40" />
    </div>
  )
}
