'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Users, UserMinus, Trash2 } from 'lucide-react'
import { useEventAttendees, useEventDetail } from '@/lib/hooks/use-events'
import { useRemoveEventAttendees } from '@/lib/hooks/use-events'
import type { EventAttendeeWithUser } from '@/lib/database/types'

interface AttendeesSectionProps {
  tribeId: string
  eventId: string
}

export function AttendeesSection({ tribeId, eventId }: AttendeesSectionProps) {
  const { data: attendees = [], isLoading: attendeesLoading } = useEventAttendees(tribeId, eventId)
  const { data: event, isLoading: eventLoading } = useEventDetail(tribeId, eventId)
  const { mutate: removeAttendees, isPending: isRemoving } = useRemoveEventAttendees()

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)

  const isLoading = attendeesLoading || eventLoading

  // Group attendees by status
  const goingAttendees = attendees.filter((a) => a.status === 'going')
  const maybeAttendees = attendees.filter((a) => a.status === 'maybe')
  const notGoingAttendees = attendees.filter((a) => a.status === 'not_going')

  const isHost = (attendee: EventAttendeeWithUser): boolean => {
    return event?.createdBy === attendee.userId
  }

  const toggleSelection = (attendeeId: string, userId: string) => {
    // Don't allow selecting the host
    if (event?.createdBy === userId) return

    const newSelected = new Set(selectedIds)
    if (newSelected.has(attendeeId)) {
      newSelected.delete(attendeeId)
    } else {
      newSelected.add(attendeeId)
    }
    setSelectedIds(newSelected)
  }

  const selectAll = (attendeeList: EventAttendeeWithUser[]) => {
    const newSelected = new Set(selectedIds)
    attendeeList.forEach((a) => {
      if (!isHost(a)) {
        newSelected.add(a.id)
      }
    })
    setSelectedIds(newSelected)
  }

  const deselectAll = () => {
    setSelectedIds(new Set())
  }

  const handleRemoveSelected = () => {
    if (selectedIds.size === 0) return

    const userIdsToRemove = attendees
      .filter((a) => selectedIds.has(a.id))
      .map((a) => a.userId)

    removeAttendees(
      { tribeId, eventId, userIds: userIdsToRemove },
      {
        onSuccess: () => {
          toast.success(`Removed ${selectedIds.size} attendee${selectedIds.size > 1 ? 's' : ''}`)
          setSelectedIds(new Set())
          setShowRemoveDialog(false)
        },
        onError: () => {
          toast.error('Failed to remove attendees')
        },
      }
    )
  }

  if (isLoading) {
    return <AttendeesSectionSkeleton />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Manage Attendees</h2>
        <p className="text-muted-foreground text-sm mt-1">
          View and manage who is attending this event
        </p>
      </div>

      {/* Action Bar */}
      {selectedIds.size > 0 && (
        <Card className="border-primary">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedIds.size} attendee{selectedIds.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={deselectAll}>
                  Clear Selection
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowRemoveDialog(true)}
                  disabled={isRemoving}
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  Remove Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Attendance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{goingAttendees.length}</p>
              <p className="text-sm text-muted-foreground">Going</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{maybeAttendees.length}</p>
              <p className="text-sm text-muted-foreground">Maybe</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{notGoingAttendees.length}</p>
              <p className="text-sm text-muted-foreground">Not Going</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendee Lists */}
      {goingAttendees.length > 0 && (
        <AttendeeListCard
          title="Going"
          description="Members confirmed to attend"
          attendees={goingAttendees}
          selectedIds={selectedIds}
          onToggle={toggleSelection}
          onSelectAll={() => selectAll(goingAttendees)}
          isHost={isHost}
          badgeVariant="default"
        />
      )}

      {maybeAttendees.length > 0 && (
        <AttendeeListCard
          title="Maybe"
          description="Members who might attend"
          attendees={maybeAttendees}
          selectedIds={selectedIds}
          onToggle={toggleSelection}
          onSelectAll={() => selectAll(maybeAttendees)}
          isHost={isHost}
          badgeVariant="secondary"
        />
      )}

      {notGoingAttendees.length > 0 && (
        <AttendeeListCard
          title="Not Going"
          description="Members who declined"
          attendees={notGoingAttendees}
          selectedIds={selectedIds}
          onToggle={toggleSelection}
          onSelectAll={() => selectAll(notGoingAttendees)}
          isHost={isHost}
          badgeVariant="outline"
        />
      )}

      {attendees.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No attendees yet</p>
          </CardContent>
        </Card>
      )}

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Attendees</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedIds.size} attendee
              {selectedIds.size > 1 ? 's' : ''} from this event? They will need to RSVP again to attend.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveSelected}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface AttendeeListCardProps {
  title: string
  description: string
  attendees: EventAttendeeWithUser[]
  selectedIds: Set<string>
  onToggle: (attendeeId: string, userId: string) => void
  onSelectAll: () => void
  isHost: (attendee: EventAttendeeWithUser) => boolean
  badgeVariant: 'default' | 'secondary' | 'outline'
}

function AttendeeListCard({
  title,
  description,
  attendees,
  selectedIds,
  onToggle,
  onSelectAll,
  isHost,
  badgeVariant,
}: AttendeeListCardProps) {
  const selectableCount = attendees.filter((a) => !isHost(a)).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {title}
              <Badge variant={badgeVariant}>{attendees.length}</Badge>
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {selectableCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onSelectAll}>
              Select All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {attendees.map((attendee) => (
            <AttendeeRow
              key={attendee.id}
              attendee={attendee}
              isSelected={selectedIds.has(attendee.id)}
              onToggle={() => onToggle(attendee.id, attendee.userId)}
              isHostUser={isHost(attendee)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface AttendeeRowProps {
  attendee: EventAttendeeWithUser
  isSelected: boolean
  onToggle: () => void
  isHostUser: boolean
}

function AttendeeRow({ attendee, isSelected, onToggle, isHostUser }: AttendeeRowProps) {
  const initials =
    attendee.user.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
        isSelected ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
      } ${isHostUser ? 'opacity-75' : 'cursor-pointer'}`}
      onClick={isHostUser ? undefined : onToggle}
    >
      {!isHostUser && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
          onClick={(e) => e.stopPropagation()}
        />
      )}
      {isHostUser && <div className="w-4" />}
      <Avatar className="h-10 w-10">
        <AvatarImage src={attendee.user.image || undefined} alt={attendee.user.name || 'Attendee'} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{attendee.user.name || 'Unknown'}</p>
        {attendee.user.username && (
          <p className="text-xs text-muted-foreground truncate">@{attendee.user.username}</p>
        )}
      </div>
      {isHostUser && (
        <Badge variant="secondary" className="text-xs">
          Host
        </Badge>
      )}
    </div>
  )
}

function AttendeesSectionSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
