'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Layers, Filter, ImageIcon, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useTribeMedia } from '@/lib/hooks/use-media'
import { useTribeAlbums } from '@/lib/hooks/use-albums'
import { useMemberWithPermissions } from '@/lib/hooks/use-tribes'
import { useSetFeaturedMedia } from '@/lib/hooks/use-media'
import { useDialogStore, type CarouselPhoto } from '@/lib/stores/dialog-store'
import { toast } from 'sonner'

interface MediaGridProps {
  tribeId: string
}

type FilterType = 'all' | 'photos' | 'albums'
type SortType = 'popular' | 'recent'

export function MediaGrid({ tribeId }: MediaGridProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('popular')

  const { data: photos, isLoading: photosLoading } = useTribeMedia(tribeId, { type: 'image' })
  const { data: albums, isLoading: albumsLoading } = useTribeAlbums(tribeId)
  const { data: memberData } = useMemberWithPermissions(tribeId)
  const { mutate: setFeatured } = useSetFeaturedMedia()
  const openDialog = useDialogStore((state) => state.openDialog)

  const isAdmin = memberData?.member?.role
    ? ['owner', 'admin', 'moderator'].includes(memberData.member.role)
    : false

  const sortedPhotos = useMemo(() => {
    if (!photos) return []
    return [...photos].sort((a, b) => {
      if (sort === 'popular') return (b.likeCount || 0) - (a.likeCount || 0)
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    })
  }, [photos, sort])

  const sortedAlbums = useMemo(() => {
    if (!albums) return []
    return [...albums].sort((a, b) => {
      if (sort === 'popular') return (b.photoCount || 0) - (a.photoCount || 0)
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    })
  }, [albums, sort])

  const showPhotos = filter === 'all' || filter === 'photos'
  const showAlbums = filter === 'all' || filter === 'albums'

  const handlePhotoClick = (index: number) => {
    if (!sortedPhotos.length) return

    const carouselPhotos: CarouselPhoto[] = sortedPhotos.map((photo) => ({
      id: photo.id,
      url: photo.fileUrl,
      caption: photo.altText || '',
      likes: photo.likeCount || 0,
      comments: 0,
      date: photo.createdAt?.toString(),
    }))

    openDialog('photo-carousel', {
      photos: carouselPhotos,
      initialIndex: index,
    })
  }

  const handleSetFeatured = (mediaId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFeatured(
      { tribeId, mediaId },
      {
        onSuccess: () => {
          toast.success('Photo set as featured')
        },
        onError: () => {
          toast.error('Failed to set featured photo')
        },
      }
    )
  }

  const isLoading = photosLoading || albumsLoading

  if (isLoading) {
    return <MediaGridSkeleton />
  }

  return (
    <div>
      {/* Filter and Sort Controls */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'photos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('photos')}
          >
            Photos
          </Button>
          <Button
            variant={filter === 'albums' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('albums')}
          >
            Albums
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              {sort === 'popular' ? 'Most Popular' : 'Most Recent'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSort('popular')}>
              Most Popular
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSort('recent')}>
              Most Recent
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Albums Section */}
      {showAlbums && sortedAlbums.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 text-lg font-semibold text-foreground">Albums</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedAlbums.map((album) => (
              <Link
                key={album.id}
                href={`/tribe/${tribeId}/media/album/${album.id}`}
                className="group overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {album.coverUrl ? (
                    <Image
                      src={album.coverUrl}
                      alt={album.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-primary/80 px-2 py-1 text-xs text-primary-foreground">
                    <Layers className="h-3 w-3" />
                    {album.photoCount || 0}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="mb-1 font-semibold text-card-foreground">{album.name}</h3>
                  {album.description && (
                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                      {album.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Photos Section */}
      {showPhotos && sortedPhotos.length > 0 && (
        <section>
          <h2 className="mb-6 text-lg font-semibold text-foreground">Photos</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer"
                onClick={() => handlePhotoClick(index)}
              >
                <Image
                  src={photo.fileUrl}
                  alt={photo.altText || 'Photo'}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-primary/70 via-transparent to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="mb-2 font-medium text-primary-foreground line-clamp-1">
                    {photo.altText || 'Untitled'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-primary-foreground/80">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {(photo.likeCount || 0).toLocaleString()}
                      </span>
                    </div>
                    {isAdmin && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-7 bg-background/80 backdrop-blur-sm"
                        onClick={(e) => handleSetFeatured(photo.id, e)}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Feature
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty States */}
      {showAlbums && sortedAlbums.length === 0 && showPhotos && sortedPhotos.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No media yet</h3>
          <p className="text-muted-foreground">
            Upload photos or create albums to get started.
          </p>
        </div>
      )}
    </div>
  )
}

function MediaGridSkeleton() {
  return (
    <div>
      <div className="mb-8 flex items-center gap-2">
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>
      <section className="mb-12">
        <Skeleton className="h-6 w-20 mb-6" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg border border-border">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-4">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <Skeleton className="h-6 w-20 mb-6" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      </section>
    </div>
  )
}
