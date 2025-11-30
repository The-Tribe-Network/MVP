'use client'

import { useEffect, useState } from 'react'
import { MediaHeader } from './media-header'
import { AllAlbumsSection } from './all-albums-section'
import { Loader2 } from 'lucide-react'

interface MediaPageClientProps {
  tribeId: string
}

interface Album {
  id: string
  name: string
  coverImageUrl?: string | null
  mediaCount: number
  createdAt: string
}

interface Media {
  id: string
  fileUrl: string
  fileType: string
  width?: number
  height?: number
  likeCount: number
  commentCount: number
  createdAt: string
  uploader: {
    name: string
    image?: string
  }
}

export function MediaPageClient({ tribeId }: MediaPageClientProps) {
  const [albums, setAlbums] = useState<Album[]>([])
  const [media, setMedia] = useState<Media[]>([])
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(true)
  const [isLoadingMedia, setIsLoadingMedia] = useState(true)

  const fetchAlbums = async () => {
    try {
      const response = await fetch(`/api/tribes/${tribeId}/albums`)
      if (response.ok) {
        const data = await response.json()
        setAlbums(data.albums || [])
      }
    } catch (err) {
      console.error('Failed to fetch albums:', err)
    } finally {
      setIsLoadingAlbums(false)
    }
  }

  const fetchMedia = async () => {
    try {
      const response = await fetch(`/api/tribes/${tribeId}/media`)
      if (response.ok) {
        const data = await response.json()
        setMedia(data.media || [])
      }
    } catch (err) {
      console.error('Failed to fetch media:', err)
    } finally {
      setIsLoadingMedia(false)
    }
  }

  useEffect(() => {
    fetchAlbums()
    fetchMedia()
  }, [tribeId])

  const handleMediaUploaded = () => {
    fetchMedia()
  }

  const handleAlbumCreated = () => {
    fetchAlbums()
  }

  if (isLoadingAlbums || isLoadingMedia) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <MediaHeader
        tribeId={tribeId}
        onMediaUploaded={handleMediaUploaded}
        onAlbumCreated={handleAlbumCreated}
      />

      <AllAlbumsSection
        albums={albums.map((album) => ({
          id: album.id,
          name: album.name,
          cover: album.coverImageUrl || 'https://via.placeholder.com/400x300',
          photoCount: album.mediaCount || 0,
          date: new Date(album.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          }),
        }))}
      />

      {media.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">All Media</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg"
              >
                <img
                  src={item.fileUrl}
                  alt="Media"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-sm">{item.uploader.name}</div>
                    <div className="text-xs text-gray-300 mt-1">
                      {item.likeCount} likes - {item.commentCount} comments
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {albums.length === 0 && media.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No albums or media yet. Upload your first photo to get started!</p>
        </div>
      )}
    </>
  )
}
