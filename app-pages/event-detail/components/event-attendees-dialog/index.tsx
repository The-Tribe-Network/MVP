'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useEventAttendees, useEventDetail } from '@/lib/hooks/use-events'
import type { EventAttendeeWithUser } from '@/lib/database/types'

interface EventAttendeesDialogProps {
  tribeId: string
  eventId: string
  children: React.ReactNode
}

export function EventAttendeesDialog({ tribeId, eventId, children }: EventAttendeesDialogProps) {
  const [open, setOpen] = useState(false)
  const { data: attendees = [], isLoading: attendeesLoading } = useEventAttendees(tribeId, eventId)
  const { data: event, isLoading: eventLoading } = useEventDetail(tribeId, eventId)

  const isLoading = attendeesLoading || eventLoading

  // Group attendees by status
  const goingAttendees = attendees.filter((a) => a.status === 'going')
  const maybeAttendees = attendees.filter((a) => a.status === 'maybe')
  const notGoingAttendees = attendees.filter((a) => a.status === 'not_going')

  const getAttendeeRole = (attendee: EventAttendeeWithUser): 'host' | null => {
    if (event && attendee.userId === event.createdBy) {
      return 'host'
    }
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Event Attendees</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <AttendeesSkeleton />
        ) : attendees.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No attendees yet
          </p>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 pr-4">
              {/* Going Section */}
              {goingAttendees.length > 0 && (
                <AttendeeSection
                  title="Going"
                  count={goingAttendees.length}
                  attendees={goingAttendees}
                  getRole={getAttendeeRole}
                />
              )}

              {/* Maybe Section */}
              {maybeAttendees.length > 0 && (
                <AttendeeSection
                  title="Maybe"
                  count={maybeAttendees.length}
                  attendees={maybeAttendees}
                  getRole={getAttendeeRole}
                />
              )}

              {/* Not Going Section */}
              {notGoingAttendees.length > 0 && (
                <AttendeeSection
                  title="Not Going"
                  count={notGoingAttendees.length}
                  attendees={notGoingAttendees}
                  getRole={getAttendeeRole}
                />
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface AttendeeSectionProps {
  title: string
  count: number
  attendees: EventAttendeeWithUser[]
  getRole: (attendee: EventAttendeeWithUser) => 'host' | null
}

function AttendeeSection({ title, count, attendees, getRole }: AttendeeSectionProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">
        {title} ({count})
      </h4>
      <div className="space-y-2">
        {attendees.map((attendee) => (
          <AttendeeRow key={attendee.id} attendee={attendee} role={getRole(attendee)} />
        ))}
      </div>
    </div>
  )
}

interface AttendeeRowProps {
  attendee: EventAttendeeWithUser
  role: 'host' | null
}

function AttendeeRow({ attendee, role }: AttendeeRowProps) {
  const initials =
    attendee.user.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'

  return (
    <div className="flex items-center gap-3 py-1">
      <Avatar className="h-9 w-9">
        <AvatarImage src={attendee.user.image || undefined} alt={attendee.user.name || 'Attendee'} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{attendee.user.name || 'Unknown'}</p>
        {attendee.user.username && (
          <p className="text-xs text-muted-foreground truncate">@{attendee.user.username}</p>
        )}
      </div>
      {role === 'host' && (
        <Badge variant="secondary" className="text-xs">
          Host
        </Badge>
      )}
    </div>
  )
}

function AttendeesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
