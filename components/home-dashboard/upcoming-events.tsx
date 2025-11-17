import { Calendar } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Event } from './types'

interface UpcomingEventsProps {
  events: Event[]
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <Card className="border-border/50 bg-card/50">
      <div className="border-b border-border/50 p-4">
        <h3 className="font-semibold text-foreground">Upcoming Events</h3>
      </div>

      <ScrollArea className="h-[280px]">
        <div className="divide-y divide-border/50">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex gap-3 p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                <Calendar className="h-5 w-5 text-purple-400" />
              </div>

              <div className="flex-1 space-y-1 overflow-hidden">
                <p className="text-sm font-medium text-foreground">{event.title}</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={event.tribe.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{event.tribe.name[0]}</AvatarFallback>
                  </Avatar>
                  <p className="text-xs text-muted-foreground">{event.tribe.name}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {event.date} at {event.time}
                </p>
                <p className="text-xs text-purple-400">
                  {event.attendees} attending
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}

