'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CalendarIcon, Clock, MapPin, Users } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { EventWithDetails } from '../lib/types'

interface EventCardProps {
  event: EventWithDetails
  tribeId: string
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; className?: string }> = {
  upcoming: { label: 'Upcoming', variant: 'default' },
  ongoing: { label: 'Active', variant: 'secondary', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
  completed: { label: 'Completed', variant: 'outline', className: 'text-muted-foreground' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
}

export function EventCard({ event, tribeId }: EventCardProps) {
  const status = statusConfig[event.status] || statusConfig.upcoming

  return (
    <Link
      href={`/tribe/${tribeId}/events/${event.id}`}
      className="group overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg"
    >
      {/* Cover Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {event.coverImageUrl ? (
          <Image
            src={event.coverImageUrl}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <CalendarIcon className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
        {/* Status Badge */}
        <Badge
          variant={status.variant}
          className={`absolute right-2 top-2 ${status.className || ''}`}
        >
          {status.label}
        </Badge>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        {/* Event Details */}
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 flex-shrink-0" />
            <span>{format(new Date(event.startDate), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{format(new Date(event.startDate), 'h:mm a')}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span>{event.attendeeCount || 0} attending</span>
          </div>
        </div>

        {/* Host Info */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Avatar className="h-6 w-6">
            <AvatarImage src={event.creator.image || undefined} />
            <AvatarFallback className="text-xs">
              {event.creator.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            Hosted by{' '}
            <span className="font-medium text-foreground">
              {event.creator.name}
            </span>
          </span>
        </div>
      </div>
    </Link>
  )
}
