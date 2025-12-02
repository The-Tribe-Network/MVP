import type { PageProps } from '@/.next/types/app/page'
import { notFound, redirect } from 'next/navigation'
import { getServerUser } from '@/lib/services/auth'
import { checkTribeMembership } from '@/lib/services/permissions'
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

  // 1. Check authentication
  const user = await getServerUser()
  if (!user) {
    redirect(`/sign-in?toast_code=SESSION_EXPIRED`)
  }

  // 2. Check tribe membership
  const isMember = await checkTribeMembership(tribe_id, user.id)
  if (!isMember) {
    redirect(`/dashboard?toast_code=UNAUTHORIZED_TRIBE_ACCESS`)
  }

  // 3. Fetch event data (using mock for now)
  const eventData = await getEventById(event_id, user.id)
  if (!eventData) {
    redirect(`/tribe/${tribe_id}/events?toast_code=EVENT_NOT_FOUND`)
  }

  // 4. Prefetch into TanStack Query cache
  const queryClient = getQueryClient()
  prefetchQuery({
    queryClient,
    queryKey: queryKeys.events.detail(event_id),
    initialData: eventData,
  })

  // 5. Dehydrate and pass to client component
  const dehydratedState = dehydrateQueryClient(queryClient)

  return (
    <EventDetailContent
      tribeId={tribe_id}
      eventId={event_id}
      dehydratedState={dehydratedState}
    />
  )
}
