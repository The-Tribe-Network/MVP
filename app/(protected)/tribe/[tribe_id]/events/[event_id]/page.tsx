
import {
  getQueryClient,
  prefetchQuery,
  dehydrateQueryClient,
} from '@/lib/utils/query-server'
import { queryKeys } from '@/lib/constants/query-keys'
import { EventDetailContent } from '@/app-pages/event-detail'

// Mock service - will need to create real service later
async function getEventById(eventId: string, userId: string) {
  // TODO: Implement real service
  return null
}

export default async function EventDetailPage({
  params
}: PageProps<'/tribe/[tribe_id]/events/[event_id]'>) {
  const { tribe_id, event_id } = await params

  const queryClient = getQueryClient()
  const dehydratedState = dehydrateQueryClient(queryClient)

  return (
    <EventDetailContent
      tribeId={tribe_id}
      eventId={event_id}
      dehydratedState={dehydratedState}
    />
  )
}
