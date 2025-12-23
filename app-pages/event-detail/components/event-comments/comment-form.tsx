'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'

interface CommentFormProps {
  onSubmit: (content: string) => void | Promise<void>
  disabled?: boolean
}

export function CommentForm({ onSubmit, disabled = false }: CommentFormProps) {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!newComment.trim() || disabled) return

    setIsSubmitting(true)
    try {
      await onSubmit(newComment)
      setNewComment('')
    } catch (error) {
      console.error('Failed to create comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Share your thoughts about this event..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        className="min-h-[80px] resize-none"
      />
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={!newComment.trim() || isSubmitting || disabled} size="sm">
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </Button>
      </div>
    </div>
  )
}
