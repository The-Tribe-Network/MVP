'use client'

import { HydrationBoundary, type DehydratedState } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { MediaHeader } from './media-header'
import { AllAlbumsSection } from './all-albums-section'
import { useTribeAlbums } from '@/lib/hooks/use-albums'
import { useTribeMedia } from '@/lib/hooks/use-media'
import type { AlbumWithMedia } from '@/lib/database/types'
import type { MediaItem } from '@/lib/hooks/use-media'
import Image from 'next/image'

interface MediaPageClientProps {
  tribeId: string
  dehydratedState?: DehydratedState
  initialAlbums?: AlbumWithMedia[]
  initialMedia?: MediaItem[]
}

export function MediaPageClient({
  tribeId,
  dehydratedState,
  initialAlbums = [],
  initialMedia = [],
}: MediaPageClientProps) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <MediaPageContent
        tribeId={tribeId}
        initialAlbums={initialAlbums}
        initialMedia={initialMedia}
      />
    </HydrationBoundary>
  )
}

function MediaPageContent({
  tribeId,
  initialAlbums,
  initialMedia,
}: {
  tribeId: string
  initialAlbums: AlbumWithMedia[]
  initialMedia: MediaItem[]
}) {
  // Use TanStack Query hooks (will use prefetched data)
  const { data: albums = initialAlbums, isLoading: isLoadingAlbums } = useTribeAlbums(tribeId)
  const { data: media = initialMedia, isLoading: isLoadingMedia } = useTribeMedia(tribeId)

  if (isLoadingAlbums || isLoadingMedia) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      {/* No callbacks needed - mutations auto-invalidate queries */}
      <MediaHeader tribeId={tribeId} />

      <AllAlbumsSection
        albums={albums.map((album) => ({
          id: album.id,
          name: album.name,
          cover: album.coverUrl || '/placeholder.svg',
          photoCount: album.photoCount || 0,
          date: new Date(album.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          }),
        }))}
      />

      {media.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">All Media</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg"
              >
                <Image
                  src={item.fileUrl}
                  alt={item.altText || 'Media'}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-sm">{item.uploader.name}</div>
                    <div className="text-xs text-gray-300 mt-1">
                      {item.likeCount} likes - {item.commentCount} comments
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {albums.length === 0 && media.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No albums or media yet. Upload your first photo to get started!
          </p>
        </div>
      )}
    </>
  )
}
