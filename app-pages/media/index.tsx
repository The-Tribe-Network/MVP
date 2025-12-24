'use client'

import { MediaHighlightsHeader } from '@/app-pages/media/components/media-highlights-header'
import { BentoGrid } from '@/app-pages/media/components/bento-grid'

interface MediaPageProps {
  tribeId: string;
}

export default function MediaPage({ tribeId }: MediaPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <MediaHighlightsHeader tribeId={tribeId} />
      <BentoGrid tribeId={tribeId} />
    </div>
  )
}
