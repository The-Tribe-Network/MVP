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
      <div className="rounded-md hover:bg-muted/30 cursor-pointer transition-colors p-2 -mx-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-medium truncate">{event.title}</h4>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formattedTime}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">
            {event.attendeeCount}
          </Badge>
        </div>
      </div>
    </Link>
  )
}
