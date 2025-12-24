'use client'

import Image from 'next/image'
import { Layers, Calendar, ImageIcon } from 'lucide-react'
import type { AlbumWithMedia } from '@/lib/database/types'

interface AlbumHeroBannerProps {
  album: AlbumWithMedia
}

export function AlbumHeroBanner({ album }: AlbumHeroBannerProps) {
  const coverUrl = album.coverUrl || album.media?.[0]?.fileUrl

  return (
    <div className="mb-8">
      <div className="relative mb-6 aspect-[21/9] overflow-hidden rounded-xl bg-muted">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={album.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h1 className="mb-2 text-4xl font-bold text-primary-foreground">
            {album.name}
          </h1>
          {album.description && (
            <p className="mb-4 max-w-2xl text-primary-foreground/80">
              {album.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/70">
            <span className="flex items-center gap-1">
              <Layers className="h-4 w-4" />
              {album.photoCount} photos
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(album.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            {album.creator && (
              <span>By {album.creator.name}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
