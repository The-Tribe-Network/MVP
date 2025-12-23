import { EventDetailContent } from '@/app-pages/event-detail'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { eventDetailOptions, eventAttendeesOptions } from '@/lib/query-options/events'
import { eventPollsOptions } from '@/lib/query-options/polls'

export default async function EventDetailPage({
  params
}: PageProps<'/tribe/[tribe_id]/events/[event_id]'>) {
  const { tribe_id, event_id } = await params

  const queryClient = new QueryClient()

  await Promise.all([
    queryClient.prefetchQuery(eventDetailOptions(tribe_id, event_id)),
    queryClient.prefetchQuery(eventPollsOptions(tribe_id, event_id)),
    queryClient.prefetchQuery(eventAttendeesOptions(tribe_id, event_id)),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EventDetailContent
        tribeId={tribe_id}
        eventId={event_id}
      />
    </HydrationBoundary>
  )
}
