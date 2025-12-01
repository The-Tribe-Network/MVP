'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TrendingUp, ImageIcon, Image } from 'lucide-react'
import { TrendingAlbums } from './trending-albums'
import { TrendingPhotos } from './trending-photos'

interface AlbumDisplay {
  id: string
  name: string
  cover: string
  photoCount: number
  date: string
}

interface PhotoDisplay {
  id: number | string
  url: string
  likes: number
  comments: number
  date: string
}

interface TrendingSectionProps {
  albums: AlbumDisplay[]
  photos: PhotoDisplay[]
}

export function TrendingSection({ albums, photos }: TrendingSectionProps) {
  const [viewMode, setViewMode] = useState<'photos' | 'albums'>('albums')

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Trending {viewMode === 'albums' ? 'Albums' : 'Photos'}</h1>
        </div>

        <div className="inline-flex rounded-lg border border-border bg-muted p-1">
          <Button
            variant={viewMode === 'photos' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('photos')}
            className="rounded-md"
          >
            <Image className="h-4 w-4 mr-2" />
            Photos
          </Button>
          <Button
            variant={viewMode === 'albums' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('albums')}
            className="rounded-md"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Albums
          </Button>
        </div>
      </div>

      {viewMode === 'albums' ? (
        <TrendingAlbums albums={albums} />
      ) : (
        <TrendingPhotos photos={photos} />
      )}
    </section>
  )
}

