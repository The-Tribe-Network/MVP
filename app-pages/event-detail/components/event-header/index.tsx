'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, X, Share2, MoreVertical } from 'lucide-react'
import type { EventWithDetails } from '@/lib/database/types'
import { EventHeaderSkeleton } from './loading'
import { EventHeaderError } from './error'

interface EventHeaderProps {
  event: EventWithDetails
  isLoading?: boolean
  isError?: boolean
  error?: Error | null
  onRetry?: () => void
}

/**
 * Event Header Section
 *
 * Displays event title, status, host info, and action buttons
 *
 * TODO: Connect RSVP and share actions to real API mutations
 */
export function EventHeader({ event, isLoading, isError, error, onRetry }: EventHeaderProps) {
  // TODO: Replace with real mutation hooks
  // const { mutate: toggleRSVP } = useToggleEventRSVP()
  // const { mutate: shareEvent } = useShareEvent()

  const handleRSVP = () => {
    // TODO: Call toggleRSVP({ eventId: event.id })
    console.log('Toggle RSVP for event:', event.id)
  }

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share event:', event.id)
  }

  // Loading state
  if (isLoading) return <EventHeaderSkeleton />

  // Error state
  if (isError) {
    return <EventHeaderError message={error?.message} onRetry={onRetry} />
  }

  return (
    <div className="flex items-start justify-between">
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
      <div className="flex items-center gap-2">
        {event.isUserAttending ? (
          <Button variant="outline" size="sm" onClick={handleRSVP}>
            <X className="h-4 w-4 mr-2" />
            Cancel RSVP
          </Button>
        ) : (
          <Button size="sm" onClick={handleRSVP}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            RSVP
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
