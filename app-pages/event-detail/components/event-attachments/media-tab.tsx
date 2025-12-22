'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Upload, Image as ImageIcon } from 'lucide-react'
import type { MediaAttachment } from '../../lib/types'

interface MediaTabProps {
  media: MediaAttachment[]
  onUpload: () => void
}

export function MediaTab({ media, onUpload }: MediaTabProps) {
  return (
    <div className="space-y-4">
      <Button onClick={onUpload} variant="outline" className="w-full" size="sm">
        <Upload className="h-4 w-4 mr-2" />
        Upload Photo or Video
      </Button>

      <ScrollArea className="h-[400px] pr-4">
        {media.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No media uploaded yet</p>
            <p className="text-xs text-muted-foreground mt-1">Share photos and videos from the event</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {media.map((item) => (
              <div key={item.id} className="group relative rounded-lg overflow-hidden border bg-muted">
                <AspectRatio ratio={1}>
                  <img src={item.url} alt="Event media" className="object-cover w-full h-full" />
                </AspectRatio>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" size="sm">
                    View
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-xs text-white truncate">By {item.uploadedBy.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
