import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EventItem } from './event-item'
import { UpcomingEventsEmpty } from './empty'
import type { Event } from '../../lib/types'

interface UpcomingEventsProps {
  events: Event[]
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  if (events.length === 0) {
    return <UpcomingEventsEmpty />
  }

  return (
    <Card className="border-border/50 bg-card/50">
      <div className="border-b border-border/50 p-4">
        <h3 className="font-semibold text-foreground">Upcoming Events</h3>
      </div>

      <ScrollArea className="h-[280px]">
        <div className="divide-y divide-border/50">
          {events.map((event) => (
            <EventItem key={event.id} event={event} />
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}

