'use client'

import { FeaturedMedia } from './featured-media'
import { PopularPhotos } from './popular-photos'
import { PopularAlbums } from './popular-albums'
import { cn } from '@/lib/utils'

interface BentoGridProps {
  tribeId: string
  className?: string
}

export function BentoGrid({ tribeId, className }: BentoGridProps) {
  return (
    <div className={cn("grid gap-4 lg:grid-cols-3 lg:grid-rows-2", className)}>
      <div className="lg:col-span-2 lg:row-span-2">
        <FeaturedMedia tribeId={tribeId} />
      </div>
      <div className="lg:row-span-1">
        <PopularPhotos tribeId={tribeId} />
      </div>
      <div className="lg:row-span-1">
        <PopularAlbums tribeId={tribeId} />
      </div>
    </div>
  )
}
