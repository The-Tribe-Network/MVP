import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'
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

        {events.length > 0 && (
          <Link href={`/tribe/${tribeId}/events`} className="flex items-center">
            <Button variant="ghost" size="sm" className="h-auto p-0 hover:text-primary/80 hover:cursor-pointer space-x-2">
              View all
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {events.length > 0 ? events.map((event) => <EventPreviewItem key={event.id} event={event} />) : (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Calendar className="h-5 w-5 text-primary" />
              </EmptyMedia>
              <EmptyTitle>
                No upcoming events
              </EmptyTitle>
              <EmptyDescription>
                No upcoming events found.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" size="sm">Create event</Button>
            </EmptyContent>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}

