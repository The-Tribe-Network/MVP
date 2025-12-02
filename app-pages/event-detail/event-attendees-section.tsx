"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Users, Crown } from "lucide-react"
import type { EventAttendee, User } from "@/lib/database/types"

interface EventAttendeesSectionProps {
  attendees: (EventAttendee & { user: User })[]
  attendeeCount: number
  eventId: string
}

export function EventAttendeesSection({
  attendees,
  attendeeCount,
  eventId
}: EventAttendeesSectionProps) {
  // Group attendees by status
  const goingAttendees = attendees.filter(a => a.status === 'going')
  const maybeAttendees = attendees.filter(a => a.status === 'maybe')

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
              <Avatar
                key={attendee.id}
                className="h-10 w-10 border-2 border-background cursor-pointer hover:scale-110 transition-transform"
              >
                <AvatarImage src={attendee.user.image || undefined} />
                <AvatarFallback>
                  {attendee.user.name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            ))}
            {attendeeCount > 12 && (
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">
                  +{attendeeCount - 12}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Attendee List */}
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {/* Going */}
            {goingAttendees.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Going ({goingAttendees.length})
                </h4>
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
                        <p className="text-sm font-medium truncate">
                          {attendee.user.name || 'Unknown User'}
                        </p>
                      </div>
                      {index === 0 && (
                        <Crown className="h-4 w-4 text-yellow-500" aria-label="Event Creator" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Maybe */}
            {maybeAttendees.length > 0 && (
              <div className="pt-3 border-t">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Maybe ({maybeAttendees.length})
                </h4>
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
                        <p className="text-sm font-medium truncate">
                          {attendee.user.name || 'Unknown User'}
                        </p>
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
        </ScrollArea>

        {/* View All Button (if needed) */}
        {attendeeCount > 20 && (
          <Button variant="outline" className="w-full mt-4" size="sm">
            View All Attendees ({attendeeCount})
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
