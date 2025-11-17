'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { RefreshCw, Image, Smile } from 'lucide-react'
import PostCard from '@/components/tribe-ui/post-card'
import type { PostCard as PostCardType } from '@/components/tribe-ui/post-card'

interface TimelineWidgetProps {
  initialPosts: PostCardType[]
}
export default function TimelineWidget({ initialPosts }: TimelineWidgetProps) {
  const [posts, setPosts] = useState<PostCardType[]>(initialPosts)

  const [newPost, setNewPost] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handlePost = () => {
    if (!newPost.trim()) return

    const post: PostCardType = {
      id: Date.now().toString(),
      author: {
        name: 'You',
        username: '@you',
        avatar: '/diverse-user-avatars.png'
      },
      content: newPost,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      isLiked: false
    }

    setPosts([post, ...posts])
    setNewPost('')
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleLike = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        }
        : post
    ))
  }

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Timeline</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* New Post Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[100px] resize-none bg-white/95 dark:bg-white/10 border-white/20"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Image className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={handlePost} disabled={!newPost.trim()}>
                Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onLike={handleLike} />
        ))}
      </div>
    </div>
  )
}

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