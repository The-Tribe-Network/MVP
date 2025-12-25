'use client'

import { Button } from '@/components/ui/button'
import { CheckCircle2, X, Share2, MoreVertical } from 'lucide-react'
import type { EventWithDetails } from '@/lib/database/types'
import { EventHeaderSkeleton } from './loading'
import { EventHeaderError } from './error'
import { useAddEventAttendee, useRemoveEventAttendee } from '@/lib/hooks/use-events'

interface EventHeaderProps {
  event: EventWithDetails | undefined
  tribeId: string
  isLoading?: boolean
  isError?: boolean
  error?: Error | null
  onRetry?: () => void
}

/**
 * Event Header Section (Actions Only)
 *
 * Displays action buttons: RSVP, Share, More menu
 * Title and status badges have been moved to EventTitleSection
 */
export function EventHeader({ event, tribeId, isLoading, isError, error, onRetry }: EventHeaderProps) {
  const { mutate: addAttendee, isPending: isAddingAttendee } = useAddEventAttendee()
  const { mutate: removeAttendee, isPending: isRemovingAttendee } = useRemoveEventAttendee()

  const handleRSVP = () => {
    if (!event) return

    if (event.isUserAttending) {
      removeAttendee({ tribeId, eventId: event.id })
    } else {
      addAttendee({ tribeId, eventId: event.id })
    }
  }

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share event:', event?.id)
  }

  const isRSVPLoading = isAddingAttendee || isRemovingAttendee

  // Loading state
  if (isLoading) return <EventHeaderSkeleton />

  // Error state
  if (isError || !event) {
    return <EventHeaderError message={error?.message} onRetry={onRetry} />
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {event.isUserAttending ? (
        <Button variant="outline" size="sm" onClick={handleRSVP} disabled={isRSVPLoading}>
          <X className="h-4 w-4 mr-2" />
          Cancel RSVP
        </Button>
      ) : (
        <Button size="sm" onClick={handleRSVP} disabled={isRSVPLoading}>
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
  )
}
