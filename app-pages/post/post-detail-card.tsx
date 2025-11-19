'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export interface PostDetail {
  id: string
  author: {
    name: string
    username: string
    avatar: string
  }
  content: string
  timestamp: string
  image?: string
}

interface PostDetailCardProps {
  post: PostDetail
  children: React.ReactNode
}

export function PostDetailCard({ post, children }: PostDetailCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Post Header */}
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.author.avatar || "/placeholder.svg"} />
              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{post.author.name}</span>
                <span className="text-sm text-muted-foreground">{post.author.username}</span>
              </div>
              <span className="text-sm text-muted-foreground">{post.timestamp}</span>
            </div>
          </div>

          {/* Post Content */}
          <p className="text-base leading-relaxed text-pretty">{post.content}</p>

          {/* Post Image */}
          {post.image && (
            <img
              src={post.image || "/placeholder.svg"}
              alt="Post content"
              className="w-full rounded-lg object-cover max-h-96"
            />
          )}

          {/* Post Actions */}
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

