import { PhotoCard } from "./photo-card"

// Local type for transformed photo data displayed in UI
interface Photo {
  id: string
  url: string
  caption: string
  likes: number
  comments: number
  date?: string
}

interface PhotoGridProps {
  photos: Photo[]
  onPhotoClick: (index: number) => void
}

export function PhotoGrid({ photos, onPhotoClick }: PhotoGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo, index) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          index={index}
          onPhotoClick={onPhotoClick}
        />
      ))}
    </div>
  )
}

