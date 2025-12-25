'use client'

import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { CommentForm } from './comment-form'
import { CommentItem } from './comment-item'
import { EventCommentsSkeleton } from './loading'
import { EventCommentsError } from './error'
import { EventCommentsEmpty } from './empty'
import { useEventComments, useCreateEventComment, useLikeEventComment } from '@/lib/hooks/use-comments'
import type { EventComment } from '../../lib/types'
import type { CommentWithStats } from '@/lib/hooks/use-comments'

interface EventCommentsSectionProps {
  tribeId: string
  eventId: string
}

/**
 * Transform backend comment data to UI format
 */
function transformCommentToUI(comment: CommentWithStats): EventComment {
  return {
    id: comment.id,
    author: {
      name: comment.author.displayName || comment.author.name || 'Unknown',
      avatar: comment.author.image || null,
    },
    content: comment.content,
    createdAt: new Date(comment.createdAt),
    likeCount: comment.likeCount,
    isLiked: comment.isLiked,
  }
}

/**
 * Event Comments Section
 *
 * Displays comments for the event with create/like functionality
 * No card wrapper - designed for use within EventTabs
 */
export function EventCommentsSection({ tribeId, eventId }: EventCommentsSectionProps) {
  const queryResult = useEventComments(tribeId, eventId)
  const { data: commentsData, isLoading, isError, refetch } = queryResult
  const error = queryResult.error as Error | null | undefined
  const createCommentMutation = useCreateEventComment()
  const likeCommentMutation = useLikeEventComment()

  const comments = commentsData ? commentsData.map(transformCommentToUI) : []

  const handleSubmitComment = async (content: string) => {
    try {
      await createCommentMutation.mutateAsync({
        tribeId,
        eventId,
        content: content.trim(),
      })
      toast.success('Comment posted')
    } catch (err) {
      console.error('Failed to create comment:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to post comment'
      toast.error(errorMessage)
    }
  }

  const handleLikeComment = (commentId: string) => {
    likeCommentMutation.mutate(
      { tribeId, eventId, commentId },
      {
        onError: (error) => {
          console.error('Failed to like comment:', error)
          toast.error('Failed to like comment')
        },
      }
    )
  }

  // Loading state
  if (isLoading) return <EventCommentsSkeleton />

  // Error state
  if (isError) {
    return (
      <EventCommentsError
        message={error?.message || 'Failed to load comments'}
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      <CommentForm onSubmit={handleSubmitComment} disabled={createCommentMutation.isPending} />

      <Separator />

      {/* Comments List */}
      {comments.length === 0 ? (
        <EventCommentsEmpty />
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} onLike={handleLikeComment} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
