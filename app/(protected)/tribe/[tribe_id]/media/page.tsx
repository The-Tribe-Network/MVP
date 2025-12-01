import type { PageProps } from '@/.next/types/app/page'
import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/services/auth'
import { checkTribeMembership } from '@/lib/services/permissions'
import { getTribeById } from '@/lib/services/tribe'
import { getAlbumsByTribe } from '@/lib/services/album'
import { getMediaByTribe } from '@/lib/services/media'
import {
  getQueryClient,
  prefetchQuery,
  dehydrateQueryClient,
} from '@/lib/utils/query-server'
import { queryKeys } from '@/lib/constants/query-keys'
import { MediaPageClient } from '@/app-pages/media'

export default async function AlbumsPage({ params }: PageProps) {
  const { tribe_id } = await params

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

  // 3. Fetch data server-side (in parallel)
  const [tribeData, albumsData, mediaData] = await Promise.all([
    getTribeById(tribe_id),
    getAlbumsByTribe(tribe_id, { limit: 50 }),
    getMediaByTribe(tribe_id, { limit: 50 }),
  ])

  if (!tribeData) {
    redirect(`/dashboard?toast_code=TRIBE_NOT_FOUND`)
  }

  // 4. Create QueryClient and prefetch data
  const queryClient = getQueryClient()

  prefetchQuery({
    queryClient,
    queryKey: queryKeys.tribes.tribe(tribe_id),
    initialData: tribeData,
  })

  prefetchQuery({
    queryClient,
    queryKey: queryKeys.albums.tribe(tribe_id),
    initialData: albumsData,
  })

  prefetchQuery({
    queryClient,
    queryKey: queryKeys.media.tribe(tribe_id, undefined),
    initialData: mediaData,
  })

  // 5. Dehydrate state
  const dehydratedState = dehydrateQueryClient(queryClient)

  // 6. Pass to client component
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 mt-16">
        <MediaPageClient
          tribeId={tribe_id}
          dehydratedState={dehydratedState}
          initialAlbums={albumsData}
          initialMedia={mediaData}
        />
      </div>
    </div>
  )
}
