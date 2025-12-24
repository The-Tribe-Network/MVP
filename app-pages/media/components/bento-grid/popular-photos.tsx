'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { Heart, ImageIcon } from 'lucide-react'
import { usePopularPhotos } from '@/lib/hooks/use-media'
import { useDialogStore, type CarouselPhoto } from '@/lib/stores/dialog-store'
import { Skeleton } from '@/components/ui/skeleton'

interface PopularPhotosProps {
  tribeId: string
}

export function PopularPhotos({ tribeId }: PopularPhotosProps) {
  const { data: allPhotos, isLoading, error } = usePopularPhotos(tribeId)
  const openDialog = useDialogStore((state) => state.openDialog)

  // Sort by likes and take top 4
  const popularPhotos = useMemo(() => {
    if (!allPhotos) return []
    return [...allPhotos]
      .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
      .slice(0, 4)
  }, [allPhotos])

  const handlePhotoClick = (index: number) => {
    if (!popularPhotos.length) return

    const photos: CarouselPhoto[] = popularPhotos.map((photo) => ({
      id: photo.id,
      url: photo.fileUrl,
      caption: photo.altText || '',
      likes: photo.likeCount || 0,
      comments: 0,
      date: photo.createdAt?.toString(),
    }))

    openDialog('photo-carousel', {
      photos,
      initialIndex: index,
    })
  }

  if (isLoading) {
    return <PopularPhotosSkeleton />
  }

  if (error) {
    return <PopularPhotosError />
  }

  if (!popularPhotos.length) {
    return <PopularPhotosEmpty />
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card p-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Popular Photos
      </h3>
      <div className="grid flex-1 grid-cols-2 gap-2">
        {popularPhotos.map((photo, index) => (
          <div
            key={photo.id}
            className="group relative aspect-square overflow-hidden rounded-md bg-muted cursor-pointer"
            onClick={() => handlePhotoClick(index)}
          >
            <Image
              src={photo.fileUrl}
              alt={photo.altText || 'Photo'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-primary/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex items-center gap-1 text-xs text-primary-foreground">
                <Heart className="h-3 w-3" />
                {(photo.likeCount || 0).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PopularPhotosSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card p-4">
      <Skeleton className="h-4 w-28 mb-4" />
      <div className="grid flex-1 grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-md" />
        ))}
      </div>
    </div>
  )
}

function PopularPhotosError() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-lg border border-border bg-card p-4 text-center">
      <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground">Failed to load photos</p>
    </div>
  )
}

function PopularPhotosEmpty() {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card p-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Popular Photos
      </h3>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No photos yet</p>
      </div>
    </div>
  )
}
