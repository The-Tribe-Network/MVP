'use client'

import { useState } from 'react'
import { NewPost } from './views/new-post'
import TimelineHeader from './timeline-header'
import TimelineContent from './views/timeline'
import { Separator } from '@/components/ui/separator'

interface TimelineWidgetProps {
  tribeId: string
}

export default function TimelineWidget({ tribeId }: TimelineWidgetProps) {
  const [view, setView] = useState<"posts" | "new post">('posts')

  return (
    <div className="space-y-4 h-full">
      <TimelineHeader
        view={view}
        tribeId={tribeId}
        onViewChange={setView}
      />
      <Separator className='mb-2' />
      {view === "new post" && <NewPost tribeId={tribeId} onViewChange={setView} />}
      {view === "posts" && <TimelineContent tribeId={tribeId} onViewChange={setView} />}
    </div>
  )
}
