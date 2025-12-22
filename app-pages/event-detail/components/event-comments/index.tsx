'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { MessageCircle } from 'lucide-react'
import { CommentForm } from './comment-form'
import { CommentItem } from './comment-item'
import { EventCommentsSkeleton } from './loading'
import { EventCommentsError } from './error'
import { EventCommentsEmpty } from './empty'
import { mockComments } from '../../lib/mock-data'
import type { EventComment } from '../../lib/types'

interface EventCommentsSectionProps {
  eventId: string
}

/**
 * Event Comments Section
 *
 * Displays comments for the event with create/like functionality
 *
 * TODO: Replace mock data with real API integration using:
 * const { data: comments, isLoading, error, isError, refetch } = useQuery(
 *   eventCommentsOptions(eventId)
 * )
 * const { mutate: createComment } = useCreateEventComment()
 * const { mutate: likeComment } = useLikeEventComment()
 */
export function EventCommentsSection({ eventId }: EventCommentsSectionProps) {
  // Mock state management (for demonstration)
  const isLoading = false
  const isError = false
  const error = null
  const [comments] = useState<EventComment[]>(mockComments)

  const handleSubmitComment = async (content: string) => {
    // TODO: Call createComment({ eventId, content })
    console.log('Creating comment:', content)
  }

  const handleLikeComment = (commentId: string) => {
    // TODO: Call likeComment({ commentId })
    console.log('Liking comment:', commentId)
  }

  // Loading state
  if (isLoading) return <EventCommentsSkeleton />

  // Error state
  if (isError) {
    return (
      <EventCommentsError
        message={error?.message}
        onRetry={() => console.log('Retry loading comments')}
      />
    )
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
        <CommentForm onSubmit={handleSubmitComment} />

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
      </CardContent>
    </Card>
  )
}
