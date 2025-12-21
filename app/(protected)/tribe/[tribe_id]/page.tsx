
import { notFound, redirect } from 'next/navigation'
import { getTribeById } from '@/lib/services/tribe'
import { getServerUser } from '@/lib/services/auth'
import { checkTribeMembership } from '@/lib/services/permissions'
import {
  prefetchQuery,
  dehydrateQueryClient,
} from '@/lib/utils/query-server'
import { queryKeys } from '@/lib/constants/query-keys'
import { TribeDashboardContent } from '@/app-pages/tribe-dashboard'
import type { TribeWithMembers } from '@/lib/database/types'
import { getQueryClient } from '@/lib/providers/query-provider'

export default async function TribeDashboardPage({ params }: PageProps<'/tribe/[tribe_id]'>) {
  const { tribe_id } = await params

  // Check authentication
  const user = await getServerUser()
  if (!user) {
    redirect(`/sign-in?toast_code=SESSION_EXPIRED`)
  }

  // Fetch tribe data server-side
  const tribeData = await getTribeById(tribe_id)

  if (!tribeData) {
    redirect(`/dashboard?toast_code=TRIBE_NOT_FOUND`)
  }

  // Check if user is a member of the tribe
  const isMember = await checkTribeMembership(tribe_id, user.id)
  if (!isMember) {
    redirect(`/dashboard?toast_code=UNAUTHORIZED_TRIBE_ACCESS`)
  }

  // Create a QueryClient instance for server-side prefetching
  const queryClient = getQueryClient()

  // Prefetch tribe data in TanStack Query cache with initialData
  // Uses TribeWithMembers type from lib/database/types.ts
  prefetchQuery<TribeWithMembers>({
    queryClient,
    queryKey: queryKeys.tribes.tribe(tribe_id),
    initialData: tribeData,
  })

  // Dehydrate the query client state to pass to the client
  const dehydratedState = dehydrateQueryClient(queryClient)

  return (
    <TribeDashboardContent
      tribeId={tribe_id}
      dehydratedState={dehydratedState}
      initialTribeData={tribeData}
    />
  )
}
