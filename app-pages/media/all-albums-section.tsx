'use client'

import { AlbumCard } from './album-card'
import { Album } from './types'

interface AllAlbumsSectionProps {
  albums: Album[]
}

export function AllAlbumsSection({ albums }: AllAlbumsSectionProps) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">All Albums</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </section>
  )
}

