'use client'

import { X, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { SelectedAlbum } from '@/components/dialogs/select-post-album'

interface AttachedAlbumPreviewProps {
  album: SelectedAlbum
  onRemove: () => void
  disabled?: boolean
}

export default function AttachedAlbumPreview({
  album,
  onRemove,
  disabled = false,
}: AttachedAlbumPreviewProps) {
  return (
    <Card className="relative overflow-hidden border border-border bg-muted/30">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 z-10 bg-background/80 hover:bg-background"
        onClick={onRemove}
        disabled={disabled}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <div className="flex gap-3 p-3">
        {/* Album Cover */}
        <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
          {album.coverUrl ? (
            <img
              src={album.coverUrl}
              alt={album.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>
        
        {/* Album Details */}
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
            Linked Album
          </span>
          <h4 className="font-semibold text-sm truncate">{album.name}</h4>
          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <ImageIcon className="h-3 w-3" />
            {album.photoCount} {album.photoCount === 1 ? 'photo' : 'photos'}
          </span>
        </div>
      </div>
    </Card>
  )
}

