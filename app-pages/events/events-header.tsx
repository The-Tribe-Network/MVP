'use client'

import { SubpageHeader } from '@/components/shared/subpage-header'
import { CreateEventDialog } from './create-event-dialog'

interface EventsHeaderProps {
  tribeId: string;
}

export function EventsHeader({ tribeId }: EventsHeaderProps) {
  return (
    <SubpageHeader
      tribeId={tribeId}
      breadcrumbs={[{ label: 'Events' }]}
      title="Tribe Events"
      subtitle="Plan and manage your tribe's events"
      actions={<CreateEventDialog />}
    />
  )
}

