'use client'

import { AlbumCard } from './album-card'
import { Album } from './types'

interface TrendingAlbumsProps {
  albums: Album[]
}

export function TrendingAlbums({ albums }: TrendingAlbumsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {albums.map((album) => (
        <AlbumCard key={album.id} album={album} variant="trending" />
      ))}
    </div>
  )
}

