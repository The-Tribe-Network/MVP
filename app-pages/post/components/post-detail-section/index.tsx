'use client'

import { useLikePost, useDeletePost } from '@/lib/hooks/use-posts'
import { toast } from 'sonner'
import PostCard from '@/components/post-card'
import { PostDetailSkeleton } from './loading'
import { PostDetailError } from './error'
import { PostDetailEmpty } from './empty'
import { usePostDetailPageStore } from '../store-provider'
import { useQuery } from '@tanstack/react-query'
import { postDetailOptions } from '@/lib/query-options/posts'

interface PostDetailSectionProps {
  tribeId: string
  postId: string
}

export function PostDetailSection({ tribeId, postId }: PostDetailSectionProps) {
  const { data: post, isLoading, error, isError, refetch } = useQuery(postDetailOptions(tribeId, postId))
  const likePostMutation = useLikePost()
  const deletePostMutation = useDeletePost()
  const openDialog = usePostDetailPageStore((s) => s.openDialog)

  const handleLike = async (postId: string) => {
    try {
      await likePostMutation.mutateAsync({ tribeId, postId })
    } catch (error) {
      console.error('Failed to toggle like:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to like post')
    }
  }

  const handleDelete = async (postId: string) => {
    // Open confirmation dialog instead of deleting directly
    openDialog('delete-post', {
      tribeId,
      postId,
      postContent: post?.content?.substring(0, 100),
    })
  }

  if (isLoading && !post) return <PostDetailSkeleton />
  if (isError) return <PostDetailError message={error?.message} onRetry={() => refetch()} />
  if (!post) return <PostDetailEmpty />

  return (
    <PostCard
      post={post}
      tribeId={tribeId}
      onLike={handleLike}
      isLiking={likePostMutation.isPending}
      clickable={false}
      avatarSize="large"
      contentSize="base"
      showActionsSeparator={true}
      onDelete={handleDelete}
      isDeleting={deletePostMutation.isPending}
    />
  )
}
