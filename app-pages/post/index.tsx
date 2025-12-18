'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HydrationBoundary, type DehydratedState } from '@tanstack/react-query'
import { PostHeader } from './post-header'
import PostCard from '@/components/post-card'
import { CommentsSection } from './comments-section'
import { Comment } from './comment-item'
import { usePost, useLikePost, useDeletePost } from '@/lib/hooks/use-posts'
import { usePostComments } from '@/lib/hooks/use-comments'
import { formatRelativeTime } from '@/lib/utils'
import { toast } from 'sonner'
import type { PostWithStats } from '@/lib/database/types'
import { Separator } from '@/components/ui/separator'

interface PostDetailContentProps {
  tribeId: string
  postId: string
  dehydratedState?: DehydratedState
  initialPostData?: PostWithStats
}

export function PostDetailContent({
  tribeId,
  postId,
  dehydratedState,
  initialPostData,
}: PostDetailContentProps) {
  const router = useRouter()
  // This hook will use the prefetched data from the server if available
  const { data: postData, isLoading } = usePost(tribeId, postId)
  const { data: commentsData, isLoading: isLoadingComments } = usePostComments(tribeId, postId)
  const likePostMutation = useLikePost()
  const deletePostMutation = useDeletePost()

  const [likingPostId, setLikingPostId] = useState<string | null>(null)
  const [likeError, setLikeError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Use prefetched data or fallback to fetched data
  const post = postData || initialPostData

  // Transform API data format to match Comment interface
  const comments: Comment[] =
    commentsData?.map((comment) => ({
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
    })) || []

  const handleLike = async (postId: string) => {
    setLikingPostId(postId)
    setLikeError(null)
    try {
      await likePostMutation.mutateAsync({
        tribeId,
        postId,
      })
      // Invalidate post detail query to refresh the data
      // The mutation already handles tribe posts list invalidation
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
    setIsDeleting(true)
    try {
      await deletePostMutation.mutateAsync({
        tribeId,
        postId,
      })
      toast.success('Post deleted successfully')
      // Redirect to timeline after successful deletion
      router.push(`/tribe/${tribeId}/timeline`)
    } catch (error) {
      console.error('Failed to delete post:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete post')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading && !post) {
    return (
      <div className="flex h-screen">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-6 space-y-6">
            <div>Loading post...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex h-screen">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-6 space-y-6">
            <div>Post not found</div>
          </div>
        </div>
      </div>
    )
  }

  // post is already in PostWithStats format from the API

  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="flex h-screen">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-6 space-y-6">
            <PostHeader />

            <PostCard
              post={post}
              tribeId={tribeId}
              onLike={handleLike}
              isLiking={likingPostId === post.id}
              likeError={likingPostId === post.id ? likeError : null}
              clickable={false}
              avatarSize="large"
              contentSize="base"
              showActionsSeparator={true}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />

            <Separator className='mb-6' />

            <CommentsSection
              tribeId={tribeId}
              postId={postId}
              initialComments={comments}
            />
          </div>
        </div>
      </div>
    </HydrationBoundary>
  )
}

