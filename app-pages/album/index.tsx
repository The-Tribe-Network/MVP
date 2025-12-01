"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { AlbumHeader } from "./album-header"
import { PhotoGrid } from "./photo-grid"
import { PhotoCarouselModal } from "./photo-carousel-modal"

export default function AlbumPageContent() {
  const params = useParams()
  const [isOpen, setIsOpen] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  // Mock data for the album
  const album = {
    id: params.id || "",
    name: "Summer Vibes 2024",
    description: "Best memories from our summer adventures! From beach days to late night bonfires.",
    date: "August 2024",
    creator: {
      name: "Sarah Chen",
      avatar: "/serene-asian-woman.png",
    },
    stats: {
      photos: 24,
      views: 1240,
      likes: 342,
    },
  }

  // Mock photos data
  const photos = Array.from({ length: 24 }).map((_, i) => ({
    id: i + 1,
    url: i % 3 === 0 ? "/summer-party.png" : i % 3 === 1 ? "/beach-day.jpg" : "/game-night-fun.png",
    caption: `Summer memory #${i + 1}`,
    likes: Math.floor(Math.random() * 100) + 10,
    comments: Math.floor(Math.random() * 20),
    date: "Aug 15, 2024",
  }))

  const openPhoto = (index: number) => {
    setCurrentPhotoIndex(index)
    setIsOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 mt-16">
        <AlbumHeader album={album} />
        <PhotoGrid photos={photos} onPhotoClick={openPhoto} />
      </div>

      <PhotoCarouselModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        photos={photos}
        currentPhotoIndex={currentPhotoIndex}
      />
    </div>
  )
}
