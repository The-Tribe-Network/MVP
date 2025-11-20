'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { RefreshCw, Image, Smile, X, Loader2 } from 'lucide-react'
import PostCard from '@/components/post-card'
import type { PostCard as PostCardType } from '@/components/post-card'
import { useTribePosts, useCreatePost, useLikePost, useDeletePost } from '@/lib/hooks/use-posts'
import { useUploadPostImage, useDeleteMedia } from '@/lib/hooks/use-upload'
import { validateImageFile } from '@/lib/utils/image'
import { formatRelativeTime } from '@/lib/utils'
import { useAuth } from '@/lib/providers/auth-provider'
import { toast } from 'sonner'

interface TimelineWidgetProps {
  tribeId: string
}

export default function TimelineWidget({ tribeId }: TimelineWidgetProps) {
  const { user } = useAuth()
  const { data: posts, isLoading, error, refetch } = useTribePosts(tribeId)
  const createPostMutation = useCreatePost()
  const likePostMutation = useLikePost()
  const deletePostMutation = useDeletePost()
  const uploadImageMutation = useUploadPostImage()
  const deleteMediaMutation = useDeleteMedia()

  const [newPost, setNewPost] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [likingPostId, setLikingPostId] = useState<string | null>(null)
  const [likeError, setLikeError] = useState<string | null>(null)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePost = async () => {
    if (!newPost.trim() || !user) return

    try {
      await createPostMutation.mutateAsync({
        tribeId,
        data: {
          content: newPost.trim(),
          mediaId: uploadedImageId || null,
        },
      })
      setNewPost('')
      setUploadedImageId(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Failed to create post:', error)
      // Error handling could be improved with toast notifications
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid image file')
      return
    }

    // Delete previous image if one exists
    const previousImageId = uploadedImageId
    if (previousImageId) {
      try {
        await deleteMediaMutation.mutateAsync(previousImageId)
      } catch (error) {
        console.error('Failed to delete previous image:', error)
        // Continue with upload even if deletion fails
      }
    }

    setIsUploadingImage(true)
    try {
      const result = await uploadImageMutation.mutateAsync({
        file,
        tribeId,
        postId: null,
      })
      setUploadedImageId(result.id)
      setImagePreview(result.url)
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Failed to upload image:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setIsUploadingImage(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = async () => {
    if (uploadedImageId) {
      try {
        await deleteMediaMutation.mutateAsync(uploadedImageId)
        toast.success('Image removed successfully')
      } catch (error) {
        console.error('Failed to delete image:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to remove image')
        // Continue to clear local state even if deletion fails
      }
    }
    setUploadedImageId(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleLike = async (postId: string) => {
    setLikingPostId(postId)
    setLikeError(null)
    try {
      await likePostMutation.mutateAsync({
        tribeId,
        postId,
      })
    } catch (error) {
      console.error('Failed to toggle like:', error)
      setLikeError(error instanceof Error ? error.message : 'Failed to like post')
      // Clear error after 3 seconds
      setTimeout(() => setLikeError(null), 3000)
    } finally {
      setLikingPostId(null)
    }
  }

  const handleDelete = async (postId: string) => {
    setDeletingPostId(postId)
    try {
      await deletePostMutation.mutateAsync({
        tribeId,
        postId,
      })
      toast.success('Post deleted successfully')
    } catch (error) {
      console.error('Failed to delete post:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete post')
    } finally {
      setDeletingPostId(null)
    }
  }

  // Transform API data to PostCard format
  const transformedPosts: PostCardType[] =
    posts?.map((post) => ({
      id: post.id,
      author: {
        id: post.author.id,
        name: post.author.name || 'Unknown',
        username: post.author.username ? `@${post.author.username}` : '@user',
        avatar: post.author.image || '/placeholder.svg',
      },
      content: post.content,
      timestamp: formatRelativeTime(post.createdAt),
      likes: post.likeCount,
      comments: post.commentCount,
      isLiked: post.isLiked,
      image: post.image || null,
    })) || []

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 hover:cursor-pointer">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <h2 className="text-2xl font-bold">Timeline</h2>
          </div>
        </CardHeader>
      </Card>

      {/* New Post Card */}
      {user && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Textarea
                placeholder="What's on your mind?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[100px] resize-none bg-white/95 dark:bg-white/10 border-white/20"
                disabled={createPostMutation.isPending}
              />

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />

              {/* Image preview */}
              {imagePreview && (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-auto object-contain max-h-[400px]"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"
                    onClick={handleRemoveImage}
                    disabled={isUploadingImage || createPostMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={handleImageClick}
                    disabled={isUploadingImage || createPostMutation.isPending}
                  >
                    {isUploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Image className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={handlePost}
                  disabled={!newPost.trim() || createPostMutation.isPending || isUploadingImage}
                >
                  {createPostMutation.isPending ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {isLoading || error || transformedPosts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="text-center text-muted-foreground">Loading posts...</div>
              ) : error ? (
                <div className="text-center text-destructive">
                  {error instanceof Error ? error.message : 'Failed to load posts'}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  No posts yet. Be the first to post!
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          transformedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              tribeId={tribeId}
              onLike={handleLike}
              isLiking={likingPostId === post.id}
              likeError={likingPostId === post.id ? likeError : null}
              onDelete={handleDelete}
              isDeleting={deletingPostId === post.id}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Keep mock data export for backward compatibility if needed
export const mockTimelineData: PostCardType[] = [
  {
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
  },
  {
    id: '2',
    author: {
      name: 'Alex Chen',
      username: '@alex',
      avatar: '/man-avatar.png'
    },
    content: 'Game night was epic! Thanks everyone for coming. Pizza, board games, and great company - what more could you ask for? 🎲',
    timestamp: '5h ago',
    likes: 18,
    comments: 7,
    isLiked: true
  },
  {
    id: '3',
    author: {
      name: 'Maya Patel',
      username: '@maya',
      avatar: '/woman-avatar-2.png'
    },
    content: 'Quick reminder: Beach cleanup this Saturday at 9am! Let\'s make a difference together 🌊',
    timestamp: '1d ago',
    likes: 24,
    comments: 11,
    isLiked: true
  }
]
