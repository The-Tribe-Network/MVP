'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DemoPost } from '../types'

interface DemoPostCardProps {
  post: DemoPost
  isLiked: boolean
  likeCount: number
  onLike: () => void
}

// Format relative time
function formatTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export function DemoPostCard({ post, isLiked, likeCount, onLike }: DemoPostCardProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleLike = () => {
    setIsAnimating(true)
    onLike()
    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <div className="px-3 md:px-4 py-3 md:py-4 hover:bg-muted/30 transition-colors">
      <div className="flex gap-3">
        <Avatar className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0">
          <AvatarImage src={post.author.image} alt={post.author.name} />
          <AvatarFallback className="text-xs">{post.author.name[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm truncate">
              {post.author.name}
            </span>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formatTime(post.createdAt)}
            </span>
          </div>

          <p className="mt-1 text-sm leading-relaxed">{post.content}</p>

          {post.image && (
            <div className="mt-3 rounded-lg overflow-hidden border border-border/50">
              <img
                src={post.image.url}
                alt="Post image"
                className="w-full h-auto max-h-[180px] object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 mt-3">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'gap-1.5 h-8 px-2 transition-all duration-200',
                isLiked
                  ? 'text-red-500 hover:text-red-500/80'
                  : 'text-muted-foreground hover:text-foreground',
                isAnimating && 'scale-110'
              )}
              onClick={handleLike}
            >
              <Heart
                className={cn('h-4 w-4', isLiked && 'fill-current')}
              />
              <span className="text-xs">{likeCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{post.commentCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 h-8 px-2 text-muted-foreground hover:text-foreground ml-auto"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
