import PostCard from "@/components/post-card"
import { useDeletePost, useLikePost, useTribePosts } from "@/lib/hooks/use-posts"
import { formatRelativeTime } from "@/lib/utils"
import { useState } from "react"
import { toast } from "sonner"
import type { PostCard as PostCardType } from "@/components/post-card"
import EmptyView from "./empty"
import { Button } from "@/components/ui/button"

interface PostsViewProps {
  tribeId: string
  onViewChange: (view: "posts" | "new post") => void
}

export default function PostsView({ tribeId, onViewChange }: PostsViewProps) {
  const { data: posts, isError } = useTribePosts(tribeId)

  const [likeError, setLikeError] = useState<string | null>(null)
  const [likingPostId, setLikingPostId] = useState<string | null>(null)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)

  const likePostMutation = useLikePost()
  const deletePostMutation = useDeletePost()

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

  if (isError) {
    return (
      <EmptyView
        title="Error Loading Posts"
        description="Failed to load posts. Please try again."
      >
        <Button>Retry</Button>
      </EmptyView>
    )
  }

  if (transformedPosts.length === 0) {
    return (
      <EmptyView
        title="No Posts Yet"
        description="There are no posts in this tribe yet. Be the first to set the tone!"
      >
        <Button onClick={() => onViewChange("new post")}>Create a Post</Button>
      </EmptyView>
    )
  }

  return (
    <div className="space-y-4">
      {transformedPosts.map((post) => (
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
      ))}
    </div>
  )
}