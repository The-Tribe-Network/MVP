'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useEventAttendees } from '@/lib/hooks/use-events'
import { EventAttendeesDialog } from '../event-attendees-dialog'
import type { EventAttendeeWithUser } from '@/lib/database/types'

interface EventAttendeesInlineProps {
  tribeId: string
  eventId: string
  maxVisible?: number
}

export function EventAttendeesInline({ tribeId, eventId, maxVisible = 5 }: EventAttendeesInlineProps) {
  const { data: attendees = [], isLoading } = useEventAttendees(tribeId, eventId)

  if (isLoading) {
    return <EventAttendeesInlineSkeleton maxVisible={maxVisible} />
  }

  // Only show "going" attendees in the inline view
  const goingAttendees = attendees.filter((a) => a.status === 'going')
  const visibleAttendees = goingAttendees.slice(0, maxVisible)
  const remainingCount = goingAttendees.length - maxVisible

  if (goingAttendees.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No attendees yet</p>
    )
  }

  return (
    <EventAttendeesDialog tribeId={tribeId} eventId={eventId}>
      <button
        type="button"
        className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
      >
        <div className="flex -space-x-2">
          {visibleAttendees.map((attendee) => (
            <AttendeeAvatarSmall key={attendee.id} attendee={attendee} />
          ))}
          {remainingCount > 0 && (
            <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">+{remainingCount}</span>
            </div>
          )}
        </div>
        <span className="text-sm text-muted-foreground ml-2">
          {goingAttendees.length} {goingAttendees.length === 1 ? 'person' : 'people'} attending
        </span>
      </button>
    </EventAttendeesDialog>
  )
}

function AttendeeAvatarSmall({ attendee }: { attendee: EventAttendeeWithUser }) {
  const initials = attendee.user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  return (
    <Avatar className="h-8 w-8 border-2 border-background">
      <AvatarImage src={attendee.user.image || undefined} alt={attendee.user.name || 'Attendee'} />
      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
    </Avatar>
  )
}

function EventAttendeesInlineSkeleton({ maxVisible }: { maxVisible: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-2">
        {Array.from({ length: Math.min(maxVisible, 3) }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-8 rounded-full border-2 border-background" />
        ))}
      </div>
      <Skeleton className="h-4 w-24 ml-2" />
    </div>
  )
}
