'use client'

import { MediaHighlightsHeader } from '@/app-pages/media/components/media-highlights-header'
import { BentoGrid } from '@/app-pages/media/components/bento-grid'

interface MediaPageProps {
  tribeId: string;
}

export default function MediaPage({ tribeId }: MediaPageProps) {
  return (
    <div className="container mx-auto px-4 py-4 h-[calc(100vh-64px-24px)] flex flex-col">
      <MediaHighlightsHeader tribeId={tribeId} />
      <BentoGrid tribeId={tribeId} className="flex-1 min-h-0" />
    </div>
  )
}
