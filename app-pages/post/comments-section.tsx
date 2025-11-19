'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CommentForm } from './comment-form'
import { CommentItem, Comment } from './comment-item'

interface CommentsSectionProps {
  initialComments: Comment[]
}

export function CommentsSection({ initialComments }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<Comment[]>(initialComments)

  const handleComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
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
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Comments</h3>

        {/* New Comment */}
        <CommentForm
          value={newComment}
          onChange={setNewComment}
          onSubmit={handleComment}
        />

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

