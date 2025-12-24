"use client"

import Image from "next/image"
import { Heart } from "lucide-react"
import type { CarouselPhoto } from "@/lib/stores/dialog-store"

interface PhotoCardProps {
  photo: CarouselPhoto
  index: number
  onPhotoClick: (index: number) => void
}

export function PhotoCard({ photo, index, onPhotoClick }: PhotoCardProps) {
  return (
    <div
      className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted"
      onClick={() => onPhotoClick(index)}
    >
      <Image
        src={photo.url || "/placeholder.svg"}
        alt={photo.caption || "Photo"}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Hover Overlay with gradient */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-primary/70 via-transparent to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
        {photo.caption && (
          <p className="mb-2 font-medium text-primary-foreground line-clamp-1">
            {photo.caption}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-primary-foreground/80">
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {photo.likes.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}

