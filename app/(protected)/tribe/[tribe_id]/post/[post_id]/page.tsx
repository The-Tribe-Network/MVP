import { notFound } from 'next/navigation'
import { getServerUser, requireAuth } from '@/lib/services/auth'
import { getPostByIdWithMetadata } from '@/lib/services/post'
import { getPostComments } from '@/lib/services/comment'
import { checkTribeMembership } from '@/lib/services/permissions'
import {
  getQueryClient,
  prefetchQuery,
  dehydrateQueryClient,
} from '@/lib/utils/query-server'
import { queryKeys } from '@/lib/constants/query-keys'
import { PostDetailContent } from '@/app-pages/post/index'

interface PostDetailPageProps {
  params: Promise<{ post_id: string; tribe_id: string }>
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { post_id, tribe_id } = await params

  // Ensure user is authenticated
  await requireAuth()

  // Get current user for passing to service function
  const user = await getServerUser()
  if (!user) {
    notFound()
  }

  // Check tribe membership
  const isMember = await checkTribeMembership(tribe_id, user.id)
  if (!isMember) {
    notFound()
  }

  // Fetch post data server-side
  const postData = await getPostByIdWithMetadata(post_id, user.id)

  if (!postData) {
    notFound()
  }

  // Verify post belongs to the tribe
  if (postData.tribeId !== tribe_id) {
    notFound()
  }

  // Fetch comments server-side
  const comments = await getPostComments(post_id, user.id)

  // Create a QueryClient instance for server-side prefetching
  const queryClient = getQueryClient()

  // Prefetch post data in TanStack Query cache with initialData
  prefetchQuery({
    queryClient,
    queryKey: queryKeys.posts.detail(post_id),
    initialData: postData,
  })

  // Prefetch comments data in TanStack Query cache with initialData
  prefetchQuery({
    queryClient,
    queryKey: queryKeys.comments.post(post_id),
    initialData: comments,
  })

  // Dehydrate the query client state to pass to the client
  const dehydratedState = dehydrateQueryClient(queryClient)

  return (
    <PostDetailContent
      tribeId={tribe_id}
      postId={post_id}
      dehydratedState={dehydratedState}
      initialPostData={postData}
    />
  )
}
