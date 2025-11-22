'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Heart, MessageCircle, Share2, Loader2, MoreVertical, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useAuth } from '@/lib/providers/auth-provider'
import PhotoMediaDialog from './dialog-content/photo-media'
import { usePathname } from 'next/navigation'

export interface PostCard {
  id: string
  author: {
    name: string
    username: string
    avatar: string
    id?: string // Optional author ID for ownership comparison
  }
  content: string
  timestamp: string
  likes: number
  comments: number
  isLiked: boolean
  // Support both image formats: object with metadata or simple string URL
  image?: { id: string; url: string; width?: number; height?: number } | string | null
}

export interface PostCardProps {
  post: PostCard
  tribeId: string
  onLike?: (postId: string) => void | Promise<void>
  isLiking?: boolean
  likeError?: string | null
  // Control whether the card is clickable (for detail page vs timeline)
  clickable?: boolean
  // Control avatar size (default 'default', 'large' for detail page)
  avatarSize?: 'default' | 'large'
  // Control content text size (default 'sm', 'base' for detail page)
  contentSize?: 'sm' | 'base'
  // Control actions separator (border-top)
  showActionsSeparator?: boolean
  // Custom actions (for detail page, can pass custom actions component)
  customActions?: React.ReactNode
  // Callback for delete action
  onDelete?: (postId: string) => void | Promise<void>
  // Whether delete is in progress
  isDeleting?: boolean
}

export default function PostCard({
  post,
  tribeId,
  onLike,
  isLiking = false,
  likeError,
  clickable = true,
  avatarSize = 'default',
  contentSize = 'sm',
  showActionsSeparator = false,
  customActions,
  onDelete,
  isDeleting = false,
}: PostCardProps) {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const pathname = usePathname();
  const { user } = useAuth()

  // Check if current user is the author (by ID comparison)
  const isAuthor = user && post.author.id && user.id === post.author.id

  // Normalize image format
  const imageUrl = typeof post.image === 'string'
    ? post.image
    : post.image?.url
  const imageWidth = typeof post.image === 'object' && post.image !== null && 'width' in post.image
    ? post.image.width
    : undefined
  const imageHeight = typeof post.image === 'object' && post.image !== null && 'height' in post.image
    ? post.image.height
    : undefined

  const avatarClassName = avatarSize === 'large' ? 'h-12 w-12' : ''
  const contentClassName = contentSize === 'base' ? 'text-base' : 'text-sm'
  const authorNameClassName = contentSize === 'base' ? 'font-semibold' : 'font-semibold text-sm'
  const usernameClassName = contentSize === 'base' ? 'text-sm text-muted-foreground' : 'text-xs text-muted-foreground'
  const timestampClassName = contentSize === 'base' ? 'text-sm text-muted-foreground' : 'text-xs text-muted-foreground'

  const cardContent = (
    <CardContent className="pt-0 px-3">
      <div className="space-y-4">
        {/* Post Header */}
        <div className="flex items-start gap-3">
          <Avatar className={avatarClassName}>
            <AvatarImage src={post.author.avatar || "/placeholder.svg"} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={authorNameClassName}>{post.author.name}</span>
              <span className={usernameClassName}>{post.author.username}</span>
              {contentSize === 'sm' && (
                <>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className={timestampClassName}>{post.timestamp}</span>
                </>
              )}
            </div>
            {contentSize === 'base' && (
              <span className={timestampClassName}>{post.timestamp}</span>
            )}
            <p className={cn("mt-2 leading-relaxed text-pretty", contentClassName)}>
              {post.content}
            </p>
          </div>
          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {isAuthor && onDelete && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (!isDeleting && onDelete) {
                      onDelete(post.id)
                    }
                  }}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Post Image */}
        {imageUrl && (
          <div
            className="mt-3 rounded-lg overflow-hidden border border-border cursor-pointer hover:opacity-90 transition-opacity"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsImageDialogOpen(true)
            }}
          >
            <img
              src={imageUrl}
              alt="Post image"
              className="w-full h-auto object-contain max-h-[500px]"
              style={{
                aspectRatio: imageWidth && imageHeight
                  ? `${imageWidth} / ${imageHeight}`
                  : undefined,
              }}
            />
          </div>
        )}

        {/* Post Actions */}
        {customActions ? (
          <div onClick={(e) => e.stopPropagation()}>
            {customActions}
          </div>
        ) : (
          <div
            className={cn(
              "flex items-center gap-1",
              showActionsSeparator ? "pt-4" : "pt-2"
            )}
            onClick={(e) => {
              // Stop all clicks in the actions area from bubbling to the Link
              e.stopPropagation()
            }}
          >
            {onLike ? (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2 transition-colors",
                  post.isLiked ? 'text-accent hover:text-accent/80' : 'text-muted-foreground',
                  isLiking && "opacity-50 cursor-not-allowed"
                )}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (!isLiking && onLike) {
                    onLike(post.id)
                  }
                }}
                disabled={isLiking}
              >
                {isLiking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className={cn("h-4 w-4 transition-all", post.isLiked && "fill-current")} />
                )}
                <span className="text-xs">{post.likes}</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2 transition-colors",
                  post.isLiked ? 'text-accent hover:text-accent/80' : 'text-muted-foreground'
                )}
                disabled
              >
                <Heart className={cn("h-4 w-4 transition-all", post.isLiked && "fill-current")} />
                <span className="text-xs">{post.likes}</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{post.comments}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground ml-auto"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        {likeError && (
          <div className="text-xs text-destructive mt-1">
            {likeError}
          </div>
        )}
      </div>
    </CardContent>
  )

  const transparentCardClassName = [
    "bg-transparent transition-colors border-y-0 border-x-0 rounded-none hover:bg-card/80 hover:rounded-lg",
    pathname === `/tribe/${tribeId}/post/${post.id}` ? "rounded-lg hover:bg-transparent" : "",
  ];

  return (
    <>
      {clickable ? (
        <Card className={cn(transparentCardClassName)}>
          <Link href={`/tribe/${tribeId}/post/${post.id}`}>
            {cardContent}
          </Link>
        </Card>
      ) : (
        <Card className={cn(transparentCardClassName)}>
          {cardContent}
        </Card>
      )}

      {/* Image Preview Dialog */}
      {imageUrl && (
        <PhotoMediaDialog isOpen={isImageDialogOpen} onOpenChange={setIsImageDialogOpen} imageUrl={imageUrl} />
      )}
    </>
  )
}

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