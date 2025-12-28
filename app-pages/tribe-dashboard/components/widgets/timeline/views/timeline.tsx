import PostCard from "@/components/post-card"
import PostCardSkeleton from "@/components/post-card-skeleton"
import { useDeletePost, useLikePost, useTribePosts } from "@/lib/hooks/use-posts"
import type { PostSortOption, PostContentType } from "@/lib/hooks/use-posts"
import { formatRelativeTime } from "@/lib/utils"
import { useState } from "react"
import { toast } from "sonner"
import EmptyView from "./empty"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface TimelineContentProps {
  tribeId: string
  onViewChange: (view: "posts" | "new post") => void
  sort: PostSortOption
  contentType: PostContentType
}

export default function TimelineContent({ tribeId, onViewChange, sort, contentType }: TimelineContentProps) {
  const { data: posts, isError, isLoading } = useTribePosts(tribeId, { sort, contentType })

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

  // posts is already in PostWithStats format from the API
  const transformedPosts = posts || []

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

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, index) => (
          <PostCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    )
  }

  if (transformedPosts.length === 0 && !isLoading) {
    // Show different message based on filters
    const isFiltered = sort !== 'new' || contentType !== 'all'
    return (
      <EmptyView
        title={isFiltered ? "No Matching Posts" : "No Posts Yet"}
        description={
          isFiltered
            ? "No posts match your current filters. Try adjusting your filters or create a new post."
            : "There are no posts in this tribe yet. Be the first to set the tone!"
        }
      >
        <Button onClick={() => onViewChange("new post")}>Create a Post</Button>
      </EmptyView>
    )
  }

  return (
    <div className="space-y-2">
      {transformedPosts.map((post) => (
        <>
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
          <Separator key={`separator-${post.id}`} />
        </>

      ))}
    </div>
  )
}