import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import EventsWidgetContent from './events-widget-content'

interface EventWidgetProps {
  tribeId: string
}

export default function EventsWidget({ tribeId }: EventWidgetProps) {
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
      <EventsWidgetContent tribeId={tribeId} />
    </Card>
  )
}

