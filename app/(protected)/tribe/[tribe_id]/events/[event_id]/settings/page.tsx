import { EventSettingsContent } from '@/app-pages/event-settings'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { eventDetailOptions } from '@/lib/query-options/events'

export default async function EventSettingsPage({ params }: PageProps<'/tribe/[tribe_id]/events/[event_id]/settings'>) {
  const { tribe_id, event_id } = await params

  const queryClient = new QueryClient()

  await Promise.all([
    queryClient.prefetchQuery(eventDetailOptions(tribe_id, event_id)),
    // TODO: Add eventSettingsOptions when API is ready
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EventSettingsContent
        tribeId={tribe_id}
        eventId={event_id}
      />
    </HydrationBoundary>
  )
}
