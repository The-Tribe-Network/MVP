'use client'

import { Calendar } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import EventsWidgetContent from './events-widget-content'

interface EventWidgetProps {
  tribeId: string
}

export default function EventsWidget({ tribeId }: EventWidgetProps) {
  return (
    <div className="space-y-3">
      <Separator />

      {/* Header */}
      <div className="flex items-center justify-between px-4">
        <Link
          href={`/tribe/${tribeId}/events`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Upcoming Events
          </h3>
        </Link>
      </div>

      <EventsWidgetContent tribeId={tribeId} />
    </div>
  )
}
