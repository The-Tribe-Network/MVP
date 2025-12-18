'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, Loader2 } from 'lucide-react'
import { useLikeComment } from '@/lib/hooks/use-comments'
import { formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

// Local UI type for formatted comment data
// Note: Uses 'timestamp' as string (formatted) and 'likes' instead of 'likeCount'
// This differs from CommentWithStats which uses Date and likeCount
export interface Comment {
  id: string
  author: {
    name: string
    username: string
    avatar: string
  }
  content: string
  timestamp: Date
  likes: number
  isLiked?: boolean
}

interface CommentItemProps {
  comment: Comment
  tribeId: string
  postId: string
  commentId: string
  isLiked?: boolean
}

export function CommentItem({ comment, tribeId, postId, commentId, isLiked: initialIsLiked }: CommentItemProps) {
  const likeCommentMutation = useLikeComment()
  const [isLiked, setIsLiked] = useState(initialIsLiked ?? comment.isLiked ?? false)
  const [likes, setLikes] = useState(comment.likes)
  const [isLiking, setIsLiking] = useState(false)

  const handleLike = async () => {
    if (isLiking) return

    setIsLiking(true)
    const previousIsLiked = isLiked
    const previousLikes = likes

    // Optimistic update
    setIsLiked(!isLiked)
    setLikes(isLiked ? likes - 1 : likes + 1)

    try {
      await likeCommentMutation.mutateAsync({
        tribeId,
        postId,
        commentId,
      })
      // The mutation will update the query cache, so we'll get the correct state from there
    } catch (error) {
      // Rollback on error
      setIsLiked(previousIsLiked)
      setLikes(previousLikes)
      console.error('Failed to toggle like:', error)
    } finally {
      setIsLiking(false)
    }
  }

  // Format timestamp
  const formattedTimestamp = formatRelativeTime(comment.timestamp)

  return (
    <div className="flex gap-3 py-3 border-t first:border-t-0">
      <Avatar>
        <AvatarImage src={comment.author.avatar || "/placeholder.svg"} />
        <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">{comment.author.name}</span>
          <span className="text-xs text-muted-foreground">{comment.author.username}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{formattedTimestamp}</span>
        </div>
        <p className="text-sm leading-relaxed text-pretty mb-2">{comment.content}</p>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-1 h-7 px-2 transition-colors",
            isLiked ? 'text-accent hover:text-accent/80' : 'text-muted-foreground',
            isLiking && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleLike}
          disabled={isLiking}
        >
          {isLiking ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Heart className={cn("h-3 w-3 transition-all", isLiked && "fill-current")} />
          )}
          <span className="text-xs">{likes}</span>
        </Button>
      </div>
    </div>
  )
}

