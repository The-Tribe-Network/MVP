'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, Loader2, Trash2 } from 'lucide-react'
import { useLikeComment } from '@/lib/hooks/use-comments'
import { formatRelativeTime, cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { CommentUIData } from '../../lib/utils'
import { useDialogStore } from '@/lib/stores/dialog-store'
import { useAuthUser } from '@/lib/hooks/use-auth'

interface CommentItemProps {
  comment: CommentUIData
  tribeId: string
  postId: string
}

export function CommentItem({ comment, tribeId, postId }: CommentItemProps) {
  const { user } = useAuthUser()
  const likeCommentMutation = useLikeComment()
  const openDialog = useDialogStore((s) => s.openDialog)

  // Check if current user is the comment author
  // Note: We need author.id from the API to properly check this
  // For now, we'll assume the author info includes the necessary data
  const isAuthor = user && user.id && comment.author && comment.author.id === user.id

  const handleLike = async () => {
    try {
      await likeCommentMutation.mutateAsync({
        tribeId,
        postId,
        commentId: comment.id,
      })
    } catch (error) {
      console.error('Failed to toggle like:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to like comment')
    }
  }

  const handleDelete = () => {
    openDialog('delete-comment', {
      tribeId,
      postId,
      commentId: comment.id,
      commentContent: comment.content.substring(0, 100),
    })
  }

  const formattedTimestamp = formatRelativeTime(comment.timestamp)

  // Check if this specific comment is being liked
  const isLiking = likeCommentMutation.isPending &&
    likeCommentMutation.variables?.commentId === comment.id

  return (
    <div className="flex gap-3 py-3 border-t first:border-t-0">
      <Avatar>
        <AvatarImage src={comment.author.avatar} />
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
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-1 h-7 px-2 transition-colors",
              comment.isLiked ? 'text-accent hover:text-accent/80' : 'text-muted-foreground',
              isLiking && "opacity-50 cursor-not-allowed"
            )}
            onClick={handleLike}
            disabled={isLiking}
          >
            {isLiking ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Heart className={cn("h-3 w-3 transition-all", comment.isLiked && "fill-current")} />
            )}
            <span className="text-xs">{comment.likes}</span>
          </Button>

          {isAuthor && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 h-7 px-2 text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
