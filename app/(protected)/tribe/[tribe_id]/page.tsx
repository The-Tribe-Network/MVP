import type { PageProps } from '@/.next/types/app/page'
import { notFound } from 'next/navigation'
import { getTribeById } from '@/lib/services/tribe'
import {
  getQueryClient,
  prefetchQuery,
  dehydrateQueryClient,
} from '@/lib/utils/query-server'
import { queryKeys } from '@/lib/constants/query-keys'
import { TribeDashboardContent } from '@/app-pages/tribe-dashboard'
import type { TribeWithMembers } from '@/lib/database/types'

export default async function TribeDashboardPage({ params }: PageProps) {
  const { tribe_id } = await params

  // Fetch tribe data server-side
  const tribeData = await getTribeById(tribe_id)

  if (!tribeData) {
    notFound()
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
