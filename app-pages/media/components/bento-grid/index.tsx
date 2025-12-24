'use client'

import { FeaturedMedia } from './featured-media'
import { PopularPhotos } from './popular-photos'
import { PopularAlbums } from './popular-albums'

interface BentoGridProps {
  tribeId: string
}

export function BentoGrid({ tribeId }: BentoGridProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
      <div className="lg:col-span-2 lg:row-span-2">
        <FeaturedMedia tribeId={tribeId} />
      </div>
      <div className="min-h-[200px] lg:row-span-1">
        <PopularPhotos tribeId={tribeId} />
      </div>
      <div className="min-h-[200px] lg:row-span-1">
        <PopularAlbums tribeId={tribeId} />
      </div>
    </div>
  )
}
