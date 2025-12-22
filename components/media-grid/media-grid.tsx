'use client'

import Image from 'next/image'
import { Check } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { MediaGridSkeleton } from './media-grid-skeleton'
import { MediaGridEmpty } from './media-grid-empty'
import type { MediaItem } from '@/lib/hooks/use-media'

interface MediaGridProps {
  media: MediaItem[]
  isLoading: boolean
  selectedIds: Set<string>
  onToggle: (media: MediaItem) => void
  selectionMode: 'single' | 'multiple'
  emptyTitle?: string
  emptyDescription?: string
  height?: string
}

export function MediaGrid({
  media,
  isLoading,
  selectedIds,
  onToggle,
  selectionMode,
  emptyTitle,
  emptyDescription,
  height = 'h-[500px]',
}: MediaGridProps) {
  if (isLoading) {
    return <MediaGridSkeleton height={height} />
  }

  if (media.length === 0) {
    return <MediaGridEmpty title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="border rounded-lg">
      <ScrollArea className={cn(height, 'p-4')}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {media.map((item: MediaItem) => {
            const isSelected = selectedIds.has(item.id)
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggle(item)}
                className={cn(
                  'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                  isSelected
                    ? 'border-primary ring-2 ring-primary ring-offset-2'
                    : 'border-transparent hover:border-muted-foreground/30'
                )}
              >
                <Image
                  src={item.fileUrl}
                  alt={item.altText || 'Media'}
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
    </div>
  )
}

