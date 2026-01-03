'use client'

import { Separator } from '@/components/ui/separator'
import { Calendar, Users, CalendarDays, Image, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import type { DemoTribe } from '../../types'

interface DemoInfoWidgetProps {
  tribe: DemoTribe
}

export function DemoInfoWidget({ tribe }: DemoInfoWidgetProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <h3 className="text-sm font-semibold px-4">Description</h3>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed px-4">
        {tribe.description}
      </p>

      <Separator className="mx-4" />

      {/* Created date */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground px-4">
        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
        <span>Created {format(tribe.createdAt, 'MMM d, yyyy')}</span>
      </div>

      {/* Location if available */}
      {tribe.location && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground px-4">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{tribe.location}</span>
        </div>
      )}

      <Separator className="mx-4" />

      {/* Stats row */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 px-4">
        {/* Members */}
        <div className="flex items-center gap-1 text-xs">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span className="font-semibold">{tribe.memberCount}</span>
          <span className="text-muted-foreground">Members</span>
        </div>

        {/* Events */}
        <div className="flex items-center gap-1 text-xs">
          <CalendarDays className="h-3 w-3 text-muted-foreground" />
          <span className="font-semibold">{tribe.eventCount}</span>
          <span className="text-muted-foreground">Events</span>
        </div>

        {/* Media */}
        <div className="flex items-center gap-1 text-xs">
          <Image className="h-3 w-3 text-muted-foreground" />
          <span className="font-semibold">{tribe.mediaCount}</span>
          <span className="text-muted-foreground">Media</span>
        </div>
      </div>
    </div>
  )
}
