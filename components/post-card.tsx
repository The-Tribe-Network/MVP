'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, Share2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PostCard {
  id: string
  author: {
    name: string
    username: string
    avatar: string
  }
  content: string
  timestamp: string
  likes: number
  comments: number
  isLiked: boolean
}

export interface PostCardProps {
  post: PostCard
  onLike: (postId: string) => void
  isLiking?: boolean
  likeError?: string | null
}

export default function PostCard({ post, onLike, isLiking = false, likeError }: PostCardProps) {
  return (
    <Card className="hover:bg-card/80 transition-colors">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Post Header */}
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={post.author.avatar || "/placeholder.svg"} />
              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{post.author.name}</span>
                <span className="text-xs text-muted-foreground">{post.author.username}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{post.timestamp}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-pretty">{post.content}</p>
            </div>
          </div>

          {/* Post Actions */}
          <div className="flex items-center gap-1 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-2 transition-colors",
                post.isLiked ? 'text-accent hover:text-accent/80' : 'text-muted-foreground',
                isLiking && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => !isLiking && onLike(post.id)}
              disabled={isLiking}
            >
              {isLiking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className={cn("h-4 w-4 transition-all", post.isLiked && "fill-current")} />
              )}
              <span className="text-xs">{post.likes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{post.comments}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground ml-auto">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          {likeError && (
            <div className="text-xs text-destructive mt-1">
              {likeError}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const mockPostCardData: PostCard = {
  id: '1',
  author: {
    name: 'Sarah Mitchell',
    username: '@sarah',
    avatar: '/diverse-woman-avatar.png'
  },
  content: 'Just finished an amazing hike with the crew! The views were absolutely breathtaking. Can\'t wait for our next adventure 🏔️',
  timestamp: '2h ago',
  likes: 12,
  comments: 3,
  isLiked: false
}