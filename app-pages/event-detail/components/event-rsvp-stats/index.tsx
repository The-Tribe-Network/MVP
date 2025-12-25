'use client'

import { CheckCircle2, HelpCircle, Users } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useEventAttendees } from '@/lib/hooks/use-events'

interface EventRsvpStatsProps {
  tribeId: string
  eventId: string
}

export function EventRsvpStats({ tribeId, eventId }: EventRsvpStatsProps) {
  const { data: attendees = [], isLoading } = useEventAttendees(tribeId, eventId)

  if (isLoading) {
    return <EventRsvpStatsSkeleton />
  }

  const goingCount = attendees.filter((a) => a.status === 'going').length
  const maybeCount = attendees.filter((a) => a.status === 'maybe').length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">RSVP</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium">{goingCount} Going</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-500/10">
            <HelpCircle className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm font-medium">{maybeCount} Maybe</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function EventRsvpStatsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-5 w-12" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}
