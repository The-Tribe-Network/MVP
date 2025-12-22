import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Crown } from 'lucide-react'
import type { EventAttendee, User } from '@/lib/database/types'

interface AttendeeListProps {
  goingAttendees: (EventAttendee & { user: User })[]
  maybeAttendees: (EventAttendee & { user: User })[]
}

export function AttendeeList({ goingAttendees, maybeAttendees }: AttendeeListProps) {
  return (
    <div className="space-y-3">
      {/* Going */}
      {goingAttendees.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Going ({goingAttendees.length})</h4>
          <div className="space-y-2">
            {goingAttendees.map((attendee, index) => (
              <div
                key={attendee.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={attendee.user.image || undefined} />
                  <AvatarFallback className="text-xs">
                    {attendee.user.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attendee.user.name || 'Unknown User'}</p>
                </div>
                {index === 0 && <Crown className="h-4 w-4 text-yellow-500" aria-label="Event Creator" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Maybe */}
      {maybeAttendees.length > 0 && (
        <div className="pt-3 border-t">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Maybe ({maybeAttendees.length})</h4>
          <div className="space-y-2">
            {maybeAttendees.map((attendee) => (
              <div
                key={attendee.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors opacity-60"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={attendee.user.image || undefined} />
                  <AvatarFallback className="text-xs">
                    {attendee.user.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attendee.user.name || 'Unknown User'}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Maybe
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
