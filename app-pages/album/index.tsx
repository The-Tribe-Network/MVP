'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { albumDetailOptions } from '@/lib/query-options'
import { AlbumHeroBanner } from './components/album-hero-banner'
import { PhotoGrid } from './components/photo-grid'
import { PhotoGridSkeleton } from './components/photo-grid/loading'
import { PhotoGridEmpty } from './components/photo-grid/empty'
import { PhotoGridError } from './components/photo-grid/error'
import { transformAlbumMediaToPhotos } from './lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface AlbumPageProps {
  tribeId: string
  albumId: string
}

export default function AlbumPage({ tribeId, albumId }: AlbumPageProps) {
  const {
    data: album,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(albumDetailOptions(tribeId, albumId))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-5 w-32 mb-6" />
          <Skeleton className="aspect-[21/9] w-full rounded-xl mb-8" />
          <PhotoGridSkeleton />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <PhotoGridError message={error?.message} onRetry={() => refetch()} />
        </div>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <PhotoGridError message="Album not found" />
        </div>
      </div>
    )
  }

  const photos = transformAlbumMediaToPhotos(album)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link
          href={`/tribe/${tribeId}/media/browse`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Browse
        </Link>

        <AlbumHeroBanner album={album} />

        <section>
          <h2 className="mb-6 text-lg font-semibold text-foreground">
            Photos in this album
          </h2>
          {photos.length === 0 ? (
            <PhotoGridEmpty />
          ) : (
            <PhotoGrid photos={photos} />
          )}
        </section>
      </div>
    </div>
  )
}
