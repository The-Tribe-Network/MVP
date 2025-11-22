'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CommentForm } from './comment-form'
import { CommentItem, Comment } from './comment-item'
import { usePostComments, useCreateComment } from '@/lib/hooks/use-comments'
import { useAuth } from '@/lib/providers/auth-provider'
import { Separator } from '@/components/ui/separator'

interface CommentsSectionProps {
  tribeId: string
  postId: string
  initialComments: Comment[]
  isLoading?: boolean
}

export function CommentsSection({
  tribeId,
  postId,
  initialComments,
  isLoading: initialIsLoading,
}: CommentsSectionProps) {
  const { user } = useAuth()
  const [newComment, setNewComment] = useState('')
  const { data: commentsData, isLoading: isLoadingComments } = usePostComments(tribeId, postId)
  const createCommentMutation = useCreateComment()

  // Use fetched comments or fallback to initial comments
  // Transform API data format to match Comment interface
  const comments: Comment[] = commentsData
    ? commentsData.map((comment) => ({
      id: comment.id,
      author: {
        name: comment.author.name || 'Unknown',
        username: comment.author.username ? `@${comment.author.username}` : '@user',
        avatar: comment.author.image || '/placeholder.svg',
      },
      content: comment.content,
      timestamp: comment.createdAt,
      likes: comment.likeCount,
      isLiked: comment.isLiked,
    }))
    : initialComments

  const isLoading = isLoadingComments || initialIsLoading

  const handleComment = async () => {
    if (!newComment.trim() || !user) return

    try {
      await createCommentMutation.mutateAsync({
        tribeId,
        postId,
        data: { content: newComment.trim() },
      })
      setNewComment('')
    } catch (error) {
      console.error('Failed to create comment:', error)
      // Error handling could be improved with toast notifications
    }
  }

  return (
    <div className='px-3'>
      <h3 className="text-lg font-semibold mb-4">Comments</h3>

      {/* New Comment */}
      <CommentForm
        value={newComment}
        onChange={setNewComment}
        onSubmit={handleComment}
        userAvatar={user?.image || '/diverse-user-avatars.png'}
        disabled={createCommentMutation.isPending}
      />

      {!isLoading && comments.length > 0 && !isLoadingComments && <Separator className='my-6' />}

      {/* Comments List */}
      {isLoading ? (
        <div className="text-sm text-muted-foreground py-6 text-center">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-sm text-muted-foreground py-6 text-center">No comments yet. Be the first to comment!</div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              tribeId={tribeId}
              postId={postId}
              commentId={comment.id}
              isLiked={comment.isLiked}
            />
          ))}
        </div>
      )}
    </div>
  )
}

