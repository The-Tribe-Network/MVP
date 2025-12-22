'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Users } from 'lucide-react'
import { AttendeeAvatar } from './attendee-avatar'
import { AttendeeList } from './attendee-list'
import { ViewAllButton } from './view-all-button'
import { EventAttendeesSkeleton } from './loading'
import type { EventAttendee, User } from '@/lib/database/types'

interface EventAttendeesSectionProps {
  attendees: (EventAttendee & { user: User })[]
  attendeeCount: number
  eventId: string
  isLoading?: boolean
}

/**
 * Event Attendees Section
 *
 * Displays list of event attendees grouped by status (going/maybe)
 *
 * TODO: If needed, connect to real API for dynamic attendee list:
 * const { data: attendees, isLoading } = useQuery(eventAttendeesOptions(eventId))
 */
export function EventAttendeesSection({
  attendees,
  attendeeCount,
  eventId,
  isLoading,
}: EventAttendeesSectionProps) {
  // Group attendees by status
  const goingAttendees = attendees.filter((a) => a.status === 'going')
  const maybeAttendees = attendees.filter((a) => a.status === 'maybe')

  // Loading state
  if (isLoading) return <EventAttendeesSkeleton />

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Attendees ({attendeeCount})
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {/* Avatar Grid - First 12 attendees */}
        <div className="mb-4">
          <div className="grid grid-cols-6 gap-2 mb-3">
            {goingAttendees.slice(0, 12).map((attendee) => (
              <AttendeeAvatar key={attendee.id} user={attendee.user} />
            ))}
            {attendeeCount > 12 && (
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">+{attendeeCount - 12}</span>
              </div>
            )}
          </div>
        </div>

        {/* Attendee List */}
        <ScrollArea className="h-[300px] pr-4">
          <AttendeeList goingAttendees={goingAttendees} maybeAttendees={maybeAttendees} />
        </ScrollArea>

        {/* View All Button (if needed) */}
        {attendeeCount > 20 && <ViewAllButton attendeeCount={attendeeCount} />}
      </CardContent>
    </Card>
  )
}
