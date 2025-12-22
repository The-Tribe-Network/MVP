'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { EventComment } from '../../lib/types'

interface CommentItemProps {
  comment: EventComment
  onLike: (commentId: string) => void
}

export function CommentItem({ comment, onLike }: CommentItemProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={comment.author.avatar || undefined} />
          <AvatarFallback>{comment.author.name[0]?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{comment.author.name}</p>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{comment.content}</p>
          <div className="flex items-center gap-4 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${comment.isLiked ? 'text-red-500' : ''}`}
              onClick={() => onLike(comment.id)}
            >
              <Heart className={`h-4 w-4 mr-1 ${comment.isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs">{comment.likeCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <span className="text-xs">Reply</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
