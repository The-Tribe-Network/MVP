'use client'

import { PhotoCard } from './photo-card'
import { Photo } from './types'

interface TrendingPhotosProps {
  photos: Photo[]
}

export function TrendingPhotos({ photos }: TrendingPhotosProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  )
}

