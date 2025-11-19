'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Share2 } from 'lucide-react'

interface PostActionsProps {
  initialLikes: number
  initialIsLiked: boolean
  commentsCount: number
}

export function PostActions({ initialLikes, initialIsLiked, commentsCount }: PostActionsProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likes, setLikes] = useState(initialLikes)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(isLiked ? likes - 1 : likes + 1)
  }

  return (
    <div className="flex items-center gap-1 pt-4 border-t">
      <Button
        variant="ghost"
        size="sm"
        className={`gap-2 ${isLiked ? 'text-accent' : 'text-muted-foreground'}`}
        onClick={handleLike}
      >
        <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
        <span>{likes}</span>
      </Button>
      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
        <MessageCircle className="h-5 w-5" />
        <span>{commentsCount}</span>
      </Button>
      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground ml-auto">
        <Share2 className="h-5 w-5" />
      </Button>
    </div>
  )
}

