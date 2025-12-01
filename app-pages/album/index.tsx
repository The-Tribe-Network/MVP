"use client"

import { useState, useEffect } from "react"
import { AlbumHeader } from "./album-header"
import { PhotoGrid } from "./photo-grid"
import { PhotoCarouselModal } from "./photo-carousel-modal"
import { Loader2 } from "lucide-react"

interface AlbumDetailClientProps {
  tribeId: string
  albumId: string
}

export function AlbumDetailClient({ tribeId, albumId }: AlbumDetailClientProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [album, setAlbum] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAlbum()
  }, [tribeId, albumId])

  const fetchAlbum = async () => {
    try {
      const response = await fetch(`/api/tribes/${tribeId}/albums/${albumId}`)
      if (response.ok) {
        const data = await response.json()
        setAlbum(data.album)
      }
    } catch (err) {
      console.error('Failed to fetch album:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const openPhoto = (index: number) => {
    setCurrentPhotoIndex(index)
    setIsOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!album) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Album not found</p>
      </div>
    )
  }

  const photos = album.media?.map((media: any) => ({
    id: media.id,
    url: media.fileUrl,
    caption: media.altText || '',
    likes: media.likeCount || 0,
    comments: media.commentCount || 0,
    date: new Date(media.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  })) || []

  const albumData = {
    id: album.id,
    name: album.name,
    description: album.description || '',
    date: new Date(album.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    }),
    creator: {
      name: album.creator?.name || 'Unknown',
      avatar: album.creator?.image || '',
    },
    stats: {
      photos: album.photoCount || 0,
      views: 0, // TODO: Implement views tracking
      likes: 0, // TODO: Implement album likes
    },
  }

  return (
    <>
      <AlbumHeader album={albumData} />
      <PhotoGrid photos={photos} onPhotoClick={openPhoto} />

      <PhotoCarouselModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        photos={photos}
        currentPhotoIndex={currentPhotoIndex}
      />
    </>
  )
}
