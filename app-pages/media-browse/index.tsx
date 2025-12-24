'use client'

import { BrowseHeader } from './components/browse-header'
import { MediaGrid } from './components/media-grid'

interface MediaBrowsePageProps {
  tribeId: string
}

export default function MediaBrowsePage({ tribeId }: MediaBrowsePageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <BrowseHeader tribeId={tribeId} />
      <MediaGrid tribeId={tribeId} />
    </div>
  )
}
