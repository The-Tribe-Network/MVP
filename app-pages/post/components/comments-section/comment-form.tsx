'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send } from 'lucide-react'

interface CommentFormProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  userAvatar?: string
  disabled?: boolean
}

export function CommentForm({
  value,
  onChange,
  onSubmit,
  userAvatar = '/diverse-user-avatars.png',
  disabled = false,
}: CommentFormProps) {
  return (
    <div className="flex gap-3">
      <Avatar>
        <AvatarImage src={userAvatar} />
        <AvatarFallback>Y</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <Textarea
          placeholder="Write a comment..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[80px] resize-none bg-white/95 dark:bg-white/10 border-white/20"
          disabled={disabled}
        />
        <div className="flex justify-end">
          <Button onClick={onSubmit} disabled={!value.trim() || disabled} size="sm">
            <Send className="h-4 w-4 mr-2" />
            Comment
          </Button>
        </div>
      </div>
    </div>
  )
}
