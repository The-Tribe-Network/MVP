import { CalendarDays } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function UpcomingEventsEmpty() {
  return (
    <Card className="border-border/50 bg-card/50">
      <div className="border-b border-border/50 p-4">
        <h3 className="font-semibold text-foreground">Upcoming Events</h3>
      </div>
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
          <CalendarDays className="h-6 w-6 text-muted-foreground" />
        </div>
        <h4 className="text-sm font-medium text-foreground mb-1">No upcoming events</h4>
        <p className="text-xs text-muted-foreground text-center">
          Events from your tribes will appear here.
        </p>
      </div>
    </Card>
  )
}

