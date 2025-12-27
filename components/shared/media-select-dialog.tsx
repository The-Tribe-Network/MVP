'use client'

import Image from 'next/image'
import { Check, Loader2, Image as ImageIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { usePublicMedia } from '@/lib/hooks/use-media'
import { cn } from '@/lib/utils'
import type { MediaItem } from '@/lib/api/media'

interface MediaSelectDialogProps {
  tribeId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (mediaId: string, url: string) => void
  title?: string
  description?: string
  selectedMediaId?: string | null
}

export function MediaSelectDialog({
  tribeId,
  open,
  onOpenChange,
  onSelect,
  title = 'Select Media',
  description = 'Choose an image from your tribe',
  selectedMediaId,
}: MediaSelectDialogProps) {
  const { data: publicMedia = [], isLoading } = usePublicMedia(tribeId)

  const handleSelect = (media: MediaItem) => {
    onSelect(media.mediaId, media.fileUrl)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="border rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : publicMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No media available</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload some photos to your tribe first!
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {publicMedia.map((media: MediaItem) => {
                  const isSelected = selectedMediaId === media.mediaId
                  return (
                    <button
                      key={media.id}
                      type="button"
                      onClick={() => handleSelect(media)}
                      className={cn(
                        'relative aspect-square rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                        isSelected
                          ? 'border-primary ring-2 ring-primary ring-offset-2'
                          : 'border-transparent hover:border-muted-foreground/30'
                      )}
                    >
                      <Image
                        src={media.fileUrl}
                        alt={media.altText || 'Media'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center">
                            <Check className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
