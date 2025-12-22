'use client'

import { useQuery } from '@tanstack/react-query'
import { AlbumCard } from '../cards/album'
import { tribeAlbumsOptions } from '@/lib/query-options'
import { FeaturedMediaSkeleton } from './loading'
import { FeaturedMediaEmpty } from './empty'
import { FeaturedMediaError } from './error'

interface FeaturedMediaSectionProps {
  tribeId: string
}

/**
 * A section containing all albums for the tribe
 * 
 * TODO: This should be a featured media section and not just albums
 * in the future, i will need to update the content section of the parent component to display both the albums and normal media
 * depending on the filters applied to the media section
 * 
 * @param tribeId - The ID of the tribe to fetch albums for
 * @returns A section containing all albums for the tribe
 */
export default function FeaturedMediaSection({ tribeId }: FeaturedMediaSectionProps) {
  const { data: albums, isLoading, error, isError, refetch } = useQuery(tribeAlbumsOptions(tribeId))

  if (isLoading) return <FeaturedMediaSkeleton />

  if (isError)
    return (
      <FeaturedMediaError
        message={error.message}
        onRetry={() => refetch()}
      />
    )

  if (!albums || albums.length === 0)
    return (
      <FeaturedMediaEmpty
        tribeId={tribeId}
      />
    )

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">All Albums</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {albums.map((album) => (
          <AlbumCard key={album.id} tribeId={tribeId} album={album} />
        ))}
      </div>
    </section>
  )
}

