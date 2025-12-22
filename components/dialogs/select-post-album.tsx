'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, ImageIcon, Calendar, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTribeAlbums } from '@/lib/hooks/use-albums'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { AlbumWithMedia } from '@/lib/database/types'

type DialogView = 'grid' | 'preview'

export interface SelectedAlbum {
  id: string
  name: string
  coverUrl: string | null
  photoCount: number
}

interface SelectPostAlbumDialogProps {
  tribeId: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (album: SelectedAlbum) => void
}

function AlbumListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="flex gap-3 p-3">
            <Skeleton className="h-16 w-16 rounded-md flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default function SelectPostAlbumDialog({
  tribeId,
  isOpen,
  onOpenChange,
  onSelect,
}: SelectPostAlbumDialogProps) {
  const [view, setView] = useState<DialogView>('grid')
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumWithMedia | null>(null)

  // Fetch albums
  const { data: albums = [], isLoading } = useTribeAlbums(tribeId)

  const handleSelectAlbum = (album: AlbumWithMedia) => {
    setSelectedAlbum(album)
    setView('preview')
  }

  const handleBack = () => {
    setView('grid')
  }

  const handleAttach = () => {
    if (selectedAlbum) {
      onSelect({
        id: selectedAlbum.id,
        name: selectedAlbum.name,
        coverUrl: selectedAlbum.coverUrl || null,
        photoCount: selectedAlbum.photoCount,
      })
      handleClose()
    }
  }

  const handleClose = () => {
    setSelectedAlbum(null)
    setView('grid')
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          'overflow-hidden flex flex-col transition-all duration-200',
          view === 'preview' ? 'max-w-lg' : 'max-w-md max-h-[90vh]'
        )}
      >
        <DialogHeader>
          <DialogTitle>
            {view === 'preview' ? 'Preview Selected Album' : 'Select Album'}
          </DialogTitle>
          <DialogDescription>
            {view === 'preview'
              ? 'Review your selection before attaching it to your post.'
              : "Choose an album from your tribe to attach to your post."}
          </DialogDescription>
        </DialogHeader>

        {view === 'grid' ? (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {isLoading ? (
              <AlbumListSkeleton />
            ) : albums.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-1">No Albums Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Create an album first to attach it to your post.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {albums.map((album) => (
                    <Card
                      key={album.id}
                      className={cn(
                        'overflow-hidden cursor-pointer transition-all',
                        'hover:bg-muted/50 hover:ring-1 hover:ring-primary/50',
                        selectedAlbum?.id === album.id && 'ring-2 ring-primary bg-muted/30'
                      )}
                      onClick={() => handleSelectAlbum(album)}
                    >
                      <div className="flex gap-3 p-3">
                        {/* Album Cover */}
                        <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                          {album.coverUrl ? (
                            <img
                              src={album.coverUrl}
                              alt={album.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          {selectedAlbum?.id === album.id && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <div className="bg-primary rounded-full p-1">
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Album Details */}
                        <div className="flex flex-col justify-center min-w-0 flex-1">
                          <h3 className="font-semibold text-sm truncate">{album.name}</h3>
                          <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <ImageIcon className="h-3 w-3" />
                              {album.photoCount} {album.photoCount === 1 ? 'photo' : 'photos'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatRelativeTime(album.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground text-center pt-2">
                  Click on an album to select it
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            {/* Preview Album */}
            {selectedAlbum && (
              <Card className="overflow-hidden">
                <div className="relative aspect-video overflow-hidden">
                  {selectedAlbum.coverUrl ? (
                    <Image
                      src={selectedAlbum.coverUrl}
                      alt={selectedAlbum.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 512px) 100vw, 512px"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-lg mb-2">{selectedAlbum.name}</h3>
                  {selectedAlbum.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {selectedAlbum.description}
                    </p>
                  )}
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" />
                      {selectedAlbum.photoCount} photos
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatRelativeTime(selectedAlbum.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
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
                  Attach Album
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

