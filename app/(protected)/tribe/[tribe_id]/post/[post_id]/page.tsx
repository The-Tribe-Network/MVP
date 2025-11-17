'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, Share2, ArrowLeft, Send } from 'lucide-react'

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(12)
  const [newComment, setNewComment] = useState('')

  // Mock post data - in real app, fetch based on params.id
  const post = {
    id: params.id,
    author: {
      name: 'Sarah Mitchell',
      username: '@sarah',
      avatar: '/diverse-woman-avatar.png'
    },
    content: 'Just finished an amazing hike with the crew! The views were absolutely breathtaking. Can\'t wait for our next adventure 🏔️',
    timestamp: '2 hours ago',
    image: '/summer-party.png'
  }

  const [comments, setComments] = useState([
    {
      id: '1',
      author: {
        name: 'Alex Chen',
        username: '@alex',
        avatar: '/man-avatar.png'
      },
      content: 'Looks amazing! Wish I could have joined you guys.',
      timestamp: '1h ago',
      likes: 5
    },
    {
      id: '2',
      author: {
        name: 'Maya Patel',
        username: '@maya',
        avatar: '/woman-avatar-2.png'
      },
      content: 'These photos are incredible! Where was this?',
      timestamp: '45m ago',
      likes: 3
    },
    {
      id: '3',
      author: {
        name: 'Jordan Lee',
        username: '@jordan',
        avatar: '/diverse-user-avatars.png'
      },
      content: 'Count me in for the next one!',
      timestamp: '30m ago',
      likes: 2
    }
  ])

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(isLiked ? likes - 1 : likes + 1)
  }

  const handleComment = () => {
    if (!newComment.trim()) return

    const comment = {
      id: Date.now().toString(),
      author: {
        name: 'You',
        username: '@you',
        avatar: '/diverse-user-avatars.png'
      },
      content: newComment,
      timestamp: 'Just now',
      likes: 0
    }

    setComments([...comments, comment])
    setNewComment('')
  }

  return (
    <div className="flex h-screen bg-card">

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {/* Post Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Post Header */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={post.author.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{post.author.name}</span>
                      <span className="text-sm text-muted-foreground">{post.author.username}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{post.timestamp}</span>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-base leading-relaxed text-pretty">{post.content}</p>

                {/* Post Image */}
                {post.image && (
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt="Post content"
                    className="w-full rounded-lg object-cover max-h-96"
                  />
                )}

                {/* Post Actions */}
                <div className="flex items-center gap-1 pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-2 ${isLiked ? 'text-accent' : 'text-muted-foreground'}`}
                    onClick={handleLike}
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{likes}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                    <MessageCircle className="h-5 w-5" />
                    <span>{comments.length}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground ml-auto">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Comments</h3>

              {/* New Comment */}
              <div className="flex gap-3 mb-6">
                <Avatar>
                  <AvatarImage src="/diverse-user-avatars.png" />
                  <AvatarFallback>Y</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] resize-none bg-white/95 dark:bg-white/10 border-white/20"
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleComment} disabled={!newComment.trim()} size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Comment
                    </Button>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 py-3 border-t first:border-t-0">
                    <Avatar>
                      <AvatarImage src={comment.author.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{comment.author.name}</span>
                        <span className="text-xs text-muted-foreground">{comment.author.username}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-pretty mb-2">{comment.content}</p>
                      <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground h-7 px-2">
                        <Heart className="h-3 w-3" />
                        <span className="text-xs">{comment.likes}</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
