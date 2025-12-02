"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageCircle, Heart, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface EventCommentsSectionProps {
  eventId: string
}

// Mock comment interface
interface EventComment {
  id: string
  author: {
    name: string
    avatar?: string | null
  }
  content: string
  createdAt: Date
  likeCount: number
  isLiked: boolean
}

// Mock data - will be replaced with real data from query
const mockComments: EventComment[] = [
  {
    id: "1",
    author: {
      name: "John Doe",
      avatar: null
    },
    content: "Can't wait for this event! Is there parking available nearby?",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    likeCount: 3,
    isLiked: false
  },
  {
    id: "2",
    author: {
      name: "Sarah Chen",
      avatar: null
    },
    content: "Yes! There's a parking lot right next to the park. See you all there!",
    createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    likeCount: 5,
    isLiked: true
  }
]

export function EventCommentsSection({ eventId }: EventCommentsSectionProps) {
  const [comments] = useState<EventComment[]>(mockComments)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // TODO: Implement real comment hooks
  // const { data: comments } = useEventComments(eventId)
  // const { mutate: createComment } = useCreateEventComment()

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      // TODO: Call real API
      // await createComment({ eventId, content: newComment })
      console.log('Creating comment:', newComment)
      setNewComment("")
    } catch (error) {
      console.error('Failed to create comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLikeComment = (commentId: string) => {
    // TODO: Implement like functionality
    console.log('Liking comment:', commentId)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Discussion ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment Form */}
        <div className="space-y-3">
          <Textarea
            placeholder="Share your thoughts about this event..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Comments List */}
        <ScrollArea className="h-[400px] pr-4">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No comments yet. Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src={comment.author.avatar || undefined} />
                      <AvatarFallback>
                        {comment.author.name[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{comment.author.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4 pt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 px-2 ${comment.isLiked ? 'text-red-500' : ''}`}
                          onClick={() => handleLikeComment(comment.id)}
                        >
                          <Heart
                            className={`h-4 w-4 mr-1 ${comment.isLiked ? 'fill-current' : ''}`}
                          />
                          <span className="text-xs">{comment.likeCount}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <span className="text-xs">Reply</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
