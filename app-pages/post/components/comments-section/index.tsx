'use client'

import { useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { useAuthUser } from '@/lib/hooks/use-auth'
import { usePostComments, useCreateComment } from '@/lib/hooks/use-comments'
import { CommentForm } from './comment-form'
import { CommentItem } from './comment-item'
import { CommentsSkeleton } from './loading'
import { CommentsError } from './error'
import { CommentsEmpty } from './empty'
import { transformCommentsForUI } from '../../lib/utils'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import { postCommentsOptions } from '@/lib/query-options'

interface CommentsSectionProps {
  tribeId: string
  postId: string
}

export function CommentsSection({ tribeId, postId }: CommentsSectionProps) {
  const { user } = useAuthUser()
  const [newComment, setNewComment] = useState('')
  const { data: commentsData, isLoading, error, isError, refetch } = useQuery(postCommentsOptions(tribeId, postId))
  const createCommentMutation = useCreateComment()

  const comments = commentsData ? transformCommentsForUI(commentsData) : []

  const handleComment = async () => {
    if (!newComment.trim() || !user) return

    try {
      await createCommentMutation.mutateAsync({
        tribeId,
        postId,
        content: newComment.trim(),
      })
      setNewComment('')
      toast.success('Comment posted')
    } catch (error) {
      console.error('Failed to create comment:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to post comment')
    }
  }

  return (
    <div className='px-3'>
      <h3 className="text-lg font-semibold mb-4">Comments</h3>

      {/* New Comment Form */}
      <CommentForm
        value={newComment}
        onChange={setNewComment}
        onSubmit={handleComment}
        userAvatar={user?.image || '/diverse-user-avatars.png'}
        disabled={createCommentMutation.isPending}
      />

      {!isLoading && comments.length > 0 && <Separator className='my-6' />}

      {/* Comments List */}
      {isLoading ? (
        <CommentsSkeleton />
      ) : isError ? (
        <CommentsError message={error?.message} onRetry={() => refetch()} />
      ) : comments.length === 0 ? (
        <CommentsEmpty />
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              tribeId={tribeId}
              postId={postId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
