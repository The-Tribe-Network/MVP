import { EventDetailContent } from '@/app-pages/event-detail'
import { dehydrate, QueryClient } from '@tanstack/react-query'

// Mock service - will need to create real service later
async function getEventById(eventId: string, userId: string) {
  // TODO: Implement real service
  return null
}

export default async function EventDetailPage({
  params
}: PageProps<'/tribe/[tribe_id]/events/[event_id]'>) {
  const { tribe_id, event_id } = await params

  const queryClient = new QueryClient()
  // await queryClient.prefetchQuery(eventDetailOptions(event_id))
  const dehydratedState = dehydrate(queryClient)

  return (
    <EventDetailContent
      tribeId={tribe_id}
      eventId={event_id}
      dehydratedState={dehydratedState}
    />
  )
}
