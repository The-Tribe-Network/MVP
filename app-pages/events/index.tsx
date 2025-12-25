'use client'

import { EventsHeader } from './events-header'
import { EventsGrid } from './components/events-grid'

interface EventsPageProps {
  tribeId: string
}

export default function EventsPage({ tribeId }: EventsPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <EventsHeader tribeId={tribeId} />
      <EventsGrid tribeId={tribeId} />
    </div>
  )
}
