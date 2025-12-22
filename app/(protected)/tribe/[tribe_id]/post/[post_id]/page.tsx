import { PostDetailContent } from '@/app-pages/post/index'
import { postCommentsOptions, postDetailOptions } from '@/lib/query-options';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'

interface PostDetailPageProps {
  params: Promise<{ post_id: string; tribe_id: string }>
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { post_id, tribe_id } = await params

  const queryClient = new QueryClient()

  await Promise.all([
    queryClient.prefetchQuery(postDetailOptions(tribe_id, post_id)),
    queryClient.prefetchQuery(postCommentsOptions(tribe_id, post_id)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostDetailContent tribeId={tribe_id} postId={post_id} />
    </HydrationBoundary>
  )
}
