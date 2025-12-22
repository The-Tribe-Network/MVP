'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CalendarIcon, Clock, MapPin, Users, CheckCircle2, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import type { EventWithDetails } from '../../lib/types'
import { useAddEventAttendee, useRemoveEventAttendee } from '@/lib/hooks/use-events'

interface EventCardProps {
  event: EventWithDetails
  tribeId: string
}

export function EventCard({ event, tribeId }: EventCardProps) {
  const { mutate: addAttendee, isPending: isAddingAttendee } = useAddEventAttendee()
  const { mutate: removeAttendee, isPending: isRemovingAttendee } = useRemoveEventAttendee()

  const isAttending = event.isUserAttending || false
  const isPending = isAddingAttendee || isRemovingAttendee

  const handleRSVP = () => {
    if (isAttending) {
      removeAttendee({ tribeId, eventId: event.id })
    } else {
      addAttendee({ tribeId, eventId: event.id, status: 'going' })
    }
  }

  return (
    <Card className="hover:border-primary/50 transition-colors group relative">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-xl">{event.title}</CardTitle>
              {isAttending && (
                <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Going
                </Badge>
              )}
            </div>
            {event.description && <CardDescription>{event.description}</CardDescription>}
          </div>
          <Button
            size="sm"
            variant={isAttending ? "outline" : "default"}
            onClick={handleRSVP}
            disabled={isPending}
          >
            {isAttending ? 'Cancel RSVP' : 'RSVP'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Event Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            <span>{format(new Date(event.startDate), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(event.startDate), 'h:mm a')}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{event.attendeeCount || 0} attending</span>
          </div>
        </div>

        {/* Host Info */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={event.creator.image || "/placeholder.svg"} />
            <AvatarFallback>{event.creator.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            Hosted by <span className="text-foreground font-medium">{event.creator.name}</span>
          </span>
        </div>

        {/* View Details Link */}
        <div className="pt-2 border-t">
          <Link href={`/tribe/${tribeId}/events/${event.id}`}>
            <Button
              variant="ghost"
              className="w-full justify-between group-hover:bg-muted"
              size="sm"
            >
              <span>View Event Details</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
