'use client'

import { useQuery } from '@tanstack/react-query'
import { tribeDetailOptions } from '@/lib/query-options'
import { useDialogStore } from '@/lib/stores/dialog-store'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Calendar, Users, Image, CalendarDays, MapPin } from 'lucide-react'
import { format } from 'date-fns'

interface SidebarInfoWidgetProps {
  tribeId: string
}

export function SidebarInfoWidget({ tribeId }: SidebarInfoWidgetProps) {
  const { data: tribe, isLoading, error } = useQuery(tribeDetailOptions(tribeId))
  const openDialog = useDialogStore((s) => s.openDialog)

  if (isLoading) {
    return <SidebarInfoWidgetSkeleton />
  }

  if (error || !tribe) {
    return (
      <div className="text-sm text-muted-foreground">
        Failed to load tribe info
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tribe name as header */}
      <h3 className="text-base font-semibold">Description:</h3>

      {/* Description */}
      {tribe.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {tribe.description}
        </p>
      )}

      <Separator />

      {/* Created date */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        <span>Created {format(new Date(tribe.createdAt), 'MMM d, yyyy')}</span>
      </div>

      {/* Location if available */}
      {tribe.location && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{tribe.location}</span>
        </div>
      )}

      <Separator />

      {/* Stats row */}
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {/* Members */}
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 hover:bg-transparent"
          onClick={() => openDialog('tribe-members', { tribeId })}
        >
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-semibold">{tribe.memberCount.toLocaleString()}</span>
            <span className="text-muted-foreground">Members</span>
          </div>
        </Button>

        {/* Events */}
        <div className="flex items-center gap-1.5 text-sm">
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-semibold">{tribe.eventCount.toLocaleString()}</span>
          <span className="text-muted-foreground">Events</span>
        </div>

        {/* Media */}
        <div className="flex items-center gap-1.5 text-sm">
          <Image className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-semibold">{tribe.mediaCount.toLocaleString()}</span>
          <span className="text-muted-foreground">Media</span>
        </div>
      </div>
    </div>
  )
}

function SidebarInfoWidgetSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Separator />
      <Skeleton className="h-4 w-40" />
      <Separator />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
}
