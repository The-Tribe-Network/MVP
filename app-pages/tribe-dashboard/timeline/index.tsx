'use client'

import { useState } from 'react'
import type { PostCard as PostCardType } from '@/components/post-card'
import { NewPost } from './views/new-post'
import TimelineHeader from './timeline-header'
import PostsView from './views/posts'
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
      {view === "posts" && <PostsView tribeId={tribeId} onViewChange={setView} />}
    </div>
  )
}

// Keep mock data export for backward compatibility if needed
export const mockTimelineData: PostCardType[] = [
  {
    id: '1',
    author: {
      name: 'Sarah Mitchell',
      username: '@sarah',
      avatar: '/diverse-woman-avatar.png'
    },
    content: 'Just finished an amazing hike with the crew! The views were absolutely breathtaking. Can\'t wait for our next adventure 🏔️',
    timestamp: '2h ago',
    likes: 12,
    comments: 3,
    isLiked: false
  },
  {
    id: '2',
    author: {
      name: 'Alex Chen',
      username: '@alex',
      avatar: '/man-avatar.png'
    },
    content: 'Game night was epic! Thanks everyone for coming. Pizza, board games, and great company - what more could you ask for? 🎲',
    timestamp: '5h ago',
    likes: 18,
    comments: 7,
    isLiked: true
  },
  {
    id: '3',
    author: {
      name: 'Maya Patel',
      username: '@maya',
      avatar: '/woman-avatar-2.png'
    },
    content: 'Quick reminder: Beach cleanup this Saturday at 9am! Let\'s make a difference together 🌊',
    timestamp: '1d ago',
    likes: 24,
    comments: 11,
    isLiked: true
  }
]
