'use client'

import { PhotoCard } from './photo-card'

interface PhotoDisplay {
  id: number | string
  url: string
  likes: number
  comments: number
  date: string
}

interface TrendingPhotosProps {
  photos: PhotoDisplay[]
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

