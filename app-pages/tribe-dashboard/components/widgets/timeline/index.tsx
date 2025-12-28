'use client'

import { useState } from 'react'
import { NewPost } from './views/new-post'
import TimelineHeader from './timeline-header'
import TimelineContent from './views/timeline'
import { Separator } from '@/components/ui/separator'
import type { PostSortOption, PostContentType } from '@/lib/hooks/use-posts'

interface TimelineWidgetProps {
  tribeId: string
}

export default function TimelineWidget({ tribeId }: TimelineWidgetProps) {
  const [view, setView] = useState<"posts" | "new post">('posts')
  const [sort, setSort] = useState<PostSortOption>('new')
  const [contentType, setContentType] = useState<PostContentType>('all')

  return (
    <div className="space-y-4 h-full">
      <TimelineHeader
        view={view}
        tribeId={tribeId}
        onViewChange={setView}
        sort={sort}
        contentType={contentType}
        onSortChange={setSort}
        onContentTypeChange={setContentType}
      />
      <Separator className='mb-2' />
      {view === "new post" && <NewPost tribeId={tribeId} onViewChange={setView} />}
      {view === "posts" && (
        <TimelineContent
          tribeId={tribeId}
          onViewChange={setView}
          sort={sort}
          contentType={contentType}
        />
      )}
    </div>
  )
}
