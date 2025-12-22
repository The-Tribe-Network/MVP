import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface UpcomingEventsEmptyProps {
  tribeId: string
}

export function UpcomingEventsEmpty({ tribeId }: UpcomingEventsEmptyProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
        <p className="text-muted-foreground mb-4">
          There are no upcoming events scheduled for this tribe yet.
        </p>
        <Button>Create Event</Button>
      </CardContent>
    </Card>
  )
}
