'use client'

import { AlbumCard } from './album-card'

interface AlbumDisplay {
  id: string
  name: string
  cover: string
  photoCount: number
  date: string
}

interface TrendingAlbumsProps {
  albums: AlbumDisplay[]
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

