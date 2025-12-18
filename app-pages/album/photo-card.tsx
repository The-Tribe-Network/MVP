import { Heart, MessageCircle } from "lucide-react"

// Local type for transformed photo data displayed in UI
interface Photo {
  id: string
  url: string
  caption: string
  likes: number
  comments: number
  date?: string
}

interface PhotoCardProps {
  photo: Photo
  index: number
  onPhotoClick: (index: number) => void
}

export function PhotoCard({ photo, index, onPhotoClick }: PhotoCardProps) {
  return (
    <div
      className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted"
      onClick={() => onPhotoClick(index)}
    >
      <img
        src={photo.url || "/placeholder.svg"}
        alt={photo.caption}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />

      {/* Hover Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex gap-4 text-white font-medium">
          <span className="flex items-center gap-1">
            <Heart className="h-5 w-5 fill-current" />
            {photo.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-5 w-5 fill-current" />
            {photo.comments}
          </span>
        </div>
      </div>
    </div>
  )
}

