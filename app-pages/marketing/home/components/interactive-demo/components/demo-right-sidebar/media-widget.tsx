'use client'

import { Separator } from '@/components/ui/separator'
import { Image } from 'lucide-react'
import type { DemoMedia } from '../../types'

interface DemoMediaWidgetProps {
  media: DemoMedia[]
}

export function DemoMediaWidget({ media }: DemoMediaWidgetProps) {
  // Only show first 4 media items
  const displayMedia = media.slice(0, 4)

  return (
    <div className="space-y-3">
      <Separator className="mx-4" />

      {/* Header */}
      <div className="flex items-center gap-2 px-4">
        <Image className="h-3.5 w-3.5 text-muted-foreground" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Media
        </h3>
      </div>

      {/* 2x2 Media grid */}
      <div className="grid grid-cols-2 gap-1.5 px-4">
        {displayMedia.map((item) => (
          <div
            key={item.id}
            className="aspect-square rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img
              src={item.fileUrl}
              alt={item.altText}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
