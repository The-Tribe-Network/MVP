import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { EventWithDetails } from '@/lib/database/types'
import EventPreviewItem from './event-preview-item'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

interface EventWidgetProps {
  events: EventWithDetails[]
  tribeId: string
};

export default function EventsWidget({ events, tribeId }: EventWidgetProps) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Upcoming Events
        </CardTitle>

        <Link href={`/tribe/${tribeId}/events`} className="flex items-center">
          <Button variant="ghost" size="sm" className="h-auto p-0 hover:text-primary/80 hover:cursor-pointer space-x-2">
            View all
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.length > 0 ? events.map((event) => <EventPreviewItem key={event.id} event={event} />) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Calendar className="h-5 w-5 text-primary" />
              </EmptyMedia>
              <EmptyTitle>
                No upcoming events
              </EmptyTitle>
              <EmptyDescription>
                Things seem to be quiet, shake things up by creating an event!
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" size="sm" asChild className="hover:bg-accent hover:text-accent-foreground">
                <Link href={`/tribe/${tribeId}/events/new`}>
                  <Plus className="size-4" />
                  New Event
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}

