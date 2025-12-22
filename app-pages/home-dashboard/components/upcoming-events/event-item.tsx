import { Calendar } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Event } from '../../lib/types'

interface EventItemProps {
  event: Event
}

export function EventItem({ event }: EventItemProps) {
  return (
    <div className="flex gap-3 p-4 transition-colors hover:bg-muted/50">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
        <Calendar className="h-5 w-5 text-primary" />
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
        <p className="text-xs text-primary">
          {event.attendees} attending
        </p>
      </div>
    </div>
  )
}

