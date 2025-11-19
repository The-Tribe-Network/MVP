'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { RefreshCw, Image, Smile } from 'lucide-react'
import PostCard from '@/components/post-card'
import type { PostCard as PostCardType } from '@/components/post-card'
import { useTribePosts, useCreatePost, useLikePost } from '@/lib/hooks/use-posts'
import { formatRelativeTime } from '@/lib/utils'
import { useAuth } from '@/lib/providers/auth-provider'

interface TimelineWidgetProps {
  tribeId: string
}

export default function TimelineWidget({ tribeId }: TimelineWidgetProps) {
  const { user } = useAuth()
  const { data: posts, isLoading, error, refetch } = useTribePosts(tribeId)
  const createPostMutation = useCreatePost()
  const likePostMutation = useLikePost()

  const [newPost, setNewPost] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [likingPostId, setLikingPostId] = useState<string | null>(null)
  const [likeError, setLikeError] = useState<string | null>(null)

  const handlePost = async () => {
    if (!newPost.trim() || !user) return

    try {
      await createPostMutation.mutateAsync({
        tribeId,
        data: { content: newPost.trim() },
      })
      setNewPost('')
    } catch (error) {
      console.error('Failed to create post:', error)
      // Error handling could be improved with toast notifications
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleLike = async (postId: string) => {
    setLikingPostId(postId)
    setLikeError(null)
    try {
      await likePostMutation.mutateAsync({
        tribeId,
        postId,
      })
    } catch (error) {
      console.error('Failed to toggle like:', error)
      setLikeError(error instanceof Error ? error.message : 'Failed to like post')
      // Clear error after 3 seconds
      setTimeout(() => setLikeError(null), 3000)
    } finally {
      setLikingPostId(null)
    }
  }

  // Transform API data to PostCard format
  const transformedPosts: PostCardType[] =
    posts?.map((post) => ({
      id: post.id,
      author: {
        name: post.author.name || 'Unknown',
        username: post.author.username ? `@${post.author.username}` : '@user',
        avatar: post.author.image || '/placeholder.svg',
      },
      content: post.content,
      timestamp: formatRelativeTime(post.createdAt),
      likes: post.likeCount,
      comments: post.commentCount,
      isLiked: post.isLiked,
    })) || []

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
      {user && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Textarea
                placeholder="What's on your mind?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[100px] resize-none bg-white/95 dark:bg-white/10 border-white/20"
                disabled={createPostMutation.isPending}
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
                    <Image className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={handlePost}
                  disabled={!newPost.trim() || createPostMutation.isPending}
                >
                  {createPostMutation.isPending ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {isLoading || error || transformedPosts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="text-center text-muted-foreground">Loading posts...</div>
              ) : error ? (
                <div className="text-center text-destructive">
                  {error instanceof Error ? error.message : 'Failed to load posts'}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  No posts yet. Be the first to post!
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          transformedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              isLiking={likingPostId === post.id}
              likeError={likingPostId === post.id ? likeError : null}
            />
          ))
        )}
      </div>
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
