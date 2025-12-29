'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ImageIcon, MoreVertical, Star, Trash2 } from 'lucide-react'
import { useFeaturedMedia, useSetFeaturedMedia, useClearFeaturedMedia } from '@/lib/hooks/use-media'
import { useDialogStore, type CarouselPhoto } from '@/lib/stores/dialog-store'
import { useMemberWithPermissions } from '@/lib/hooks/use-tribes'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface FeaturedMediaProps {
  tribeId: string
}

export function FeaturedMedia({ tribeId }: FeaturedMediaProps) {
  const { data: featuredMedia, isLoading, error } = useFeaturedMedia(tribeId)
  const { data: memberData } = useMemberWithPermissions(tribeId)
  const { mutate: clearFeatured, isPending: isClearing } = useClearFeaturedMedia()
  const openDialog = useDialogStore((state) => state.openDialog)

  const isAdmin = memberData?.member?.role
    ? ['owner', 'admin', 'moderator'].includes(memberData.member.role)
    : false

  const handleClick = () => {
    if (!featuredMedia) return

    const photo: CarouselPhoto = {
      id: featuredMedia.id,
      url: featuredMedia.fileUrl,
      caption: featuredMedia.altText || '',
      likes: featuredMedia.likeCount,
      comments: 0,
      date: featuredMedia.createdAt.toString(),
    }

    openDialog('photo-carousel', {
      photos: [photo],
      initialIndex: 0,
    })
  }

  const handleClearFeatured = () => {
    clearFeatured(tribeId, {
      onSuccess: () => {
        toast.success('Featured photo cleared')
      },
      onError: () => {
        toast.error('Failed to clear featured photo')
      },
    })
  }

  if (isLoading) {
    return <FeaturedMediaSkeleton />
  }

  if (error) {
    return <FeaturedMediaError />
  }

  if (!featuredMedia) {
    return <FeaturedMediaEmpty tribeId={tribeId} />
  }

  return (
    <div
      className="group relative h-full overflow-hidden rounded-lg bg-muted cursor-pointer"
      onClick={handleClick}
    >
      <Image
        src={featuredMedia.fileUrl}
        alt={featuredMedia.altText || 'Featured photo'}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 via-30% to-transparent transition-colors group-hover:from-black/90 group-hover:via-black/30" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <span className="mb-2 inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          Featured
        </span>
        <h2 className="mb-2 text-2xl font-bold text-primary-foreground">
          {featuredMedia.altText || 'Featured Photo'}
        </h2>
        {featuredMedia.albumId && featuredMedia.albumName && (
          <Link
            href={`/tribe/${tribeId}/media/album/${featuredMedia.albumId}`}
            className="mb-4 block text-sm text-primary-foreground/80 hover:text-primary-foreground hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            From: {featuredMedia.albumName}
          </Link>
        )}
        <div className="flex items-center gap-4 text-primary-foreground/70">
          <span className="flex items-center gap-1 text-sm">
            <Heart className="h-4 w-4" />
            {featuredMedia.likeCount.toLocaleString()}
          </span>
          <span className="text-sm">
            By {featuredMedia.uploader.name}
          </span>
        </div>
      </div>

      {/* Admin dropdown */}
      {isAdmin && (
        <div className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-background/80 backdrop-blur-sm"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleClearFeatured}
                disabled={isClearing}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Featured
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}

function FeaturedMediaSkeleton() {
  return (
    <div className="h-full overflow-hidden rounded-lg">
      <Skeleton className="h-full w-full" />
    </div>
  )
}

function FeaturedMediaError() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center">
      <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">Failed to load featured media</p>
    </div>
  )
}

function FeaturedMediaEmpty({ tribeId }: { tribeId: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
      <Star className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">No Featured Photo</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        Set a featured photo to highlight it here. You can feature any photo from the tribe's media gallery.
      </p>
      <Link href={`/tribe/${tribeId}/media/browse`}>
        <Button variant="outline">
          Browse Media
        </Button>
      </Link>
    </div>
  )
}
