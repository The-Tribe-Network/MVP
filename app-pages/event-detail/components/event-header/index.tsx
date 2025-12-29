'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CheckCircle2, X, Share2, MoreVertical, Settings, Copy, Calendar, Flag } from 'lucide-react'
import type { EventWithDetails } from '@/lib/database/types'
import { EventHeaderSkeleton } from './loading'
import { EventHeaderError } from './error'
import { useAddEventAttendee, useRemoveEventAttendee } from '@/lib/hooks/use-events'
import { toast } from 'sonner'

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
    if (!event) return

    const url = `${window.location.origin}/tribe/${tribeId}/events/${event.id}`
    navigator.clipboard.writeText(url)
    toast.success('Event link copied to clipboard')
  }

  const handleCopyLink = () => {
    if (!event) return

    const url = `${window.location.origin}/tribe/${tribeId}/events/${event.id}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard')
  }

  const handleAddToCalendar = () => {
    // TODO: Implement calendar export
    toast.info('Calendar export coming soon')
  }

  const handleReport = () => {
    // TODO: Implement report functionality
    toast.info('Report functionality coming soon')
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
      <Button variant="outline" size="sm" onClick={handleShare}>
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
      {event.isUserAttending ? (
        <Button variant="destructive" size="sm" onClick={handleRSVP} disabled={isRSVPLoading}>
          <X className="h-4 w-4 mr-2" />
          Cancel RSVP
        </Button>
      ) : (
        <Button size="sm" onClick={handleRSVP} disabled={isRSVPLoading}>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          RSVP
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`/tribe/${tribeId}/events/${event.id}/settings`}>
              <Settings className="h-4 w-4 mr-2" />
              Event Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCopyLink}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAddToCalendar}>
            <Calendar className="h-4 w-4 mr-2" />
            Add to Calendar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleReport} className="text-destructive focus:text-destructive">
            <Flag className="h-4 w-4 mr-2" />
            Report Event
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
