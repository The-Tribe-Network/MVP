'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Layers, ImageIcon } from 'lucide-react'
import { usePopularAlbums } from '@/lib/hooks/use-albums'
import { Skeleton } from '@/components/ui/skeleton'

interface PopularAlbumsProps {
  tribeId: string
}

export function PopularAlbums({ tribeId }: PopularAlbumsProps) {
  const { data: allAlbums, isLoading, error } = usePopularAlbums(tribeId)

  // Sort by photo count and take top 3
  const popularAlbums = useMemo(() => {
    if (!allAlbums) return []
    return [...allAlbums]
      .sort((a, b) => (b.photoCount || 0) - (a.photoCount || 0))
      .slice(0, 3)
  }, [allAlbums])

  if (isLoading) {
    return <PopularAlbumsSkeleton />
  }

  if (error) {
    return <PopularAlbumsError />
  }

  if (!popularAlbums.length) {
    return <PopularAlbumsEmpty />
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card p-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Popular Albums
      </h3>
      <div className="flex flex-1 flex-col gap-2">
        {popularAlbums.map((album) => (
          <Link
            key={album.id}
            href={`/tribe/${tribeId}/media/album/${album.id}`}
            className="group flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
              {album.coverUrl ? (
                <Image
                  src={album.coverUrl}
                  alt={album.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-foreground">
                {album.name}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  {album.photoCount || 0}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function PopularAlbumsSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card p-4">
      <Skeleton className="h-4 w-28 mb-4" />
      <div className="flex flex-1 flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="h-12 w-12 rounded-md" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PopularAlbumsError() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-lg border border-border bg-card p-4 text-center">
      <Layers className="h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground">Failed to load albums</p>
    </div>
  )
}

function PopularAlbumsEmpty() {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card p-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Popular Albums
      </h3>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Layers className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No albums yet</p>
      </div>
    </div>
  )
}
