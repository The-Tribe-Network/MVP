'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MediaGrid } from '@/components/media-grid'
import { useTribeMedia } from '@/lib/hooks/use-media'
import { useTribeAlbums } from '@/lib/hooks/use-albums'
import { cn } from '@/lib/utils'
import type { MediaItem } from '@/lib/hooks/use-media'

type DialogView = 'grid' | 'preview'

interface SelectPostMediaDialogProps {
  tribeId: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (media: { id: string; url: string }) => void
}

// Calculate optimal preview dimensions based on image aspect ratio
function getPreviewDimensions(width?: number, height?: number) {
  if (!width || !height) {
    return { width: 800, height: 600 }
  }

  const aspectRatio = width / height
  const maxWidth = Math.min(window.innerWidth * 0.9, 1200)
  const maxHeight = window.innerHeight * 0.7

  let previewWidth: number
  let previewHeight: number

  if (aspectRatio > 1) {
    // Landscape
    previewWidth = Math.min(width, maxWidth)
    previewHeight = previewWidth / aspectRatio
    if (previewHeight > maxHeight) {
      previewHeight = maxHeight
      previewWidth = previewHeight * aspectRatio
    }
  } else {
    // Portrait or square
    previewHeight = Math.min(height, maxHeight)
    previewWidth = previewHeight * aspectRatio
    if (previewWidth > maxWidth) {
      previewWidth = maxWidth
      previewHeight = previewWidth / aspectRatio
    }
  }

  return {
    width: Math.round(previewWidth),
    height: Math.round(previewHeight),
  }
}

export default function SelectPostMediaDialog({
  tribeId,
  isOpen,
  onOpenChange,
  onSelect,
}: SelectPostMediaDialogProps) {
  const [view, setView] = useState<DialogView>('grid')
  const [albumFilter, setAlbumFilter] = useState<string | null | 'all'>('all')
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)

  // Calculate preview dimensions based on selected media
  const previewDimensions = useMemo(() => {
    if (!selectedMedia) return { width: 800, height: 600 }
    return getPreviewDimensions(
      selectedMedia.width ?? undefined,
      selectedMedia.height ?? undefined
    )
  }, [selectedMedia])

  // Fetch albums for dropdown
  const { data: albums = [], isLoading: isLoadingAlbums } = useTribeAlbums(tribeId)

  // Fetch media based on album filter
  const { data: media = [], isLoading: isLoadingMedia } = useTribeMedia(
    tribeId,
    albumFilter === 'all' ? undefined : { albumId: albumFilter === 'null' ? null : albumFilter }
  )

  const handleAlbumFilterChange = (value: string) => {
    if (value === 'all') {
      setAlbumFilter('all')
    } else if (value === 'null') {
      setAlbumFilter('null')
    } else {
      setAlbumFilter(value)
    }
  }

  const handleSelectMedia = (item: MediaItem) => {
    setSelectedMedia(item)
    setView('preview')
  }

  const handleBack = () => {
    setView('grid')
  }

  const handleAttach = () => {
    if (selectedMedia) {
      onSelect({ id: selectedMedia.id, url: selectedMedia.fileUrl })
      handleClose()
    }
  }

  const handleClose = () => {
    setSelectedMedia(null)
    setAlbumFilter('all')
    setView('grid')
    onOpenChange(false)
  }

  const isLoading = isLoadingAlbums || isLoadingMedia
  const selectedIds = selectedMedia ? new Set([selectedMedia.id]) : new Set<string>()

  const getEmptyDescription = () => {
    if (albumFilter === 'all') {
      return 'Upload some photos to your tribe first!'
    }
    return 'This album has no media yet.'
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          'overflow-hidden flex flex-col transition-all duration-200',
          view === 'preview' ? 'max-w-fit' : 'max-w-3xl max-h-[90vh]'
        )}
        style={view === 'preview' ? { width: previewDimensions.width + 48 } : undefined}
      >
        <DialogHeader>
          <DialogTitle>
            {view === 'preview' ? 'Preview Selected Media' : 'Select Media'}
          </DialogTitle>
          <DialogDescription>
            {view === 'preview'
              ? 'Review your selection before attaching it to your post.'
              : "Choose an image from your tribe's media library to attach to your post."}
          </DialogDescription>
        </DialogHeader>

        {view === 'grid' ? (
          <div className="flex-1 overflow-hidden space-y-4">
            {/* Album Filter */}
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap">Filter by Album:</Label>
              <Select
                value={albumFilter === null ? 'null' : albumFilter || 'all'}
                onValueChange={handleAlbumFilterChange}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Albums</SelectItem>
                  <SelectItem value="null">General (No Album)</SelectItem>
                  {albums.map((album) => (
                    <SelectItem key={album.id} value={album.id}>
                      {album.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Media Grid */}
            <MediaGrid
              media={media}
              isLoading={isLoading}
              selectedIds={selectedIds}
              onToggle={handleSelectMedia}
              selectionMode="single"
              emptyDescription={getEmptyDescription()}
              height="h-[400px]"
            />

            {/* Selection info */}
            <p className="text-sm text-muted-foreground text-center">
              Click on an image to select it
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex items-center justify-center">
            {/* Preview Image */}
            {selectedMedia && (
              <div
                className="relative rounded-lg overflow-hidden border bg-muted"
                style={{
                  width: previewDimensions.width,
                  height: previewDimensions.height,
                }}
              >
                <Image
                  src={selectedMedia.fileUrl}
                  alt={selectedMedia.altText || 'Selected media'}
                  fill
                  className="object-contain"
                  sizes={`${previewDimensions.width}px`}
                  priority
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex-row gap-2 sm:justify-between">
          {view === 'preview' ? (
            <>
              <Button variant="outline" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Choose Different
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleAttach}>
                  Attach
                </Button>
              </div>
            </>
          ) : (
            <>
              <div />
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
