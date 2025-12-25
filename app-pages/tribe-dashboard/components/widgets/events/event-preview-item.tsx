import { Badge } from "@/components/ui/badge";
import { EventWithDetails } from "@/lib/database/types";
import { Calendar, Clock, MapPin } from "lucide-react";
import Link from "next/link";

interface EventPreviewItemProps {
  event: EventWithDetails;
}

export default function EventPreviewItem({ event }: EventPreviewItemProps) {
  const eventDate = new Date(event.startDate)
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })

  return (
    <Link href={`/tribe/${event.tribe.id}/events/${event.id}`} className="block">
      <div className="p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors space-y-2">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-sm">{event.title}</h3>
        <Badge variant="secondary" className="text-xs">
          {event.attendeeCount} going
        </Badge>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formattedTime}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{event.location || 'TBD'}</span>
        </div>
      </div>
      </div>
    </Link>
  )
}