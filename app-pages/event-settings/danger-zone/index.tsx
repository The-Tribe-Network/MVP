'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Ban, Copy, Trash2, Download } from 'lucide-react'
import type { EventWithDetails } from '@/lib/database/types'

interface DangerZoneSectionProps {
  tribeId: string
  eventId: string
  event: EventWithDetails
}

export function DangerZoneSection({ tribeId, eventId, event }: DangerZoneSectionProps) {
  const router = useRouter()
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const isCancelled = event.status === 'cancelled'
  const isCompleted = event.status === 'completed'

  const handleCancelEvent = () => {
    // TODO: Implement API call when ready
    console.log('Cancelling event:', { tribeId, eventId })
    toast.success('Event cancelled successfully')
    setCancelDialogOpen(false)
  }

  const handleDeleteEvent = () => {
    if (deleteConfirmText !== event.title) {
      toast.error('Please type the event title to confirm deletion')
      return
    }
    // TODO: Implement API call when ready
    console.log('Deleting event:', { tribeId, eventId })
    toast.success('Event deleted successfully')
    setDeleteDialogOpen(false)
    router.push(`/tribe/${tribeId}/events`)
  }

  const handleDuplicateEvent = () => {
    // TODO: Implement API call when ready
    console.log('Duplicating event:', { tribeId, eventId })
    toast.success('Event duplicated! Redirecting to the new event...')
  }

  const handleExportAttendees = () => {
    // TODO: Implement API call when ready
    console.log('Exporting attendees:', { tribeId, eventId })
    toast.success('Attendee list exported successfully')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Irreversible and destructive actions for this event
        </p>
      </div>

      {/* Export Attendees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Download className="h-4 w-4" />
            Export Attendee List
          </CardTitle>
          <CardDescription>
            Download a CSV file of all attendees and their RSVP status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleExportAttendees}>
            <Download className="h-4 w-4 mr-2" />
            Export to CSV
          </Button>
        </CardContent>
      </Card>

      {/* Duplicate Event */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Copy className="h-4 w-4" />
            Duplicate Event
          </CardTitle>
          <CardDescription>
            Create a copy of this event with the same settings (useful for recurring events)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleDuplicateEvent}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate Event
          </Button>
        </CardContent>
      </Card>

      {/* Cancel Event */}
      {!isCancelled && !isCompleted && (
        <Card className="border-amber-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-amber-600">
              <Ban className="h-4 w-4" />
              Cancel Event
            </CardTitle>
            <CardDescription>
              Mark this event as cancelled. All attendees will be notified.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
              onClick={() => setCancelDialogOpen(true)}
            >
              <Ban className="h-4 w-4 mr-2" />
              Cancel Event
            </Button>
          </CardContent>
        </Card>
      )}

      {isCancelled && (
        <Card className="border-amber-500/50 bg-amber-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-amber-600">
              <Ban className="h-5 w-5" />
              <p className="font-medium">This event has been cancelled</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Event */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <Trash2 className="h-4 w-4" />
            Delete Event
          </CardTitle>
          <CardDescription>
            Permanently delete this event and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Event
          </Button>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Cancel Event?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the event as cancelled and notify all {event.attendeeCount} attendee(s).
              You can still view the event, but RSVPs will be closed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Event</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelEvent}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Cancel Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Event Permanently?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  This action cannot be undone. This will permanently delete the event
                  <span className="font-semibold"> "{event.title}"</span> and remove:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>All RSVP data ({event.attendeeCount} attendees)</li>
                  <li>All comments and discussions</li>
                  <li>All polls and voting data</li>
                  <li>All attached media and links</li>
                </ul>
                <div className="pt-2">
                  <Label htmlFor="confirm-delete" className="text-foreground">
                    Type <span className="font-mono font-semibold">{event.title}</span> to confirm:
                  </Label>
                  <Input
                    id="confirm-delete"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type event title here"
                    className="mt-2"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              disabled={deleteConfirmText !== event.title}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
