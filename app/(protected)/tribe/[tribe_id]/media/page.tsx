import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';

import {
  tribeDetailOptions,
  popularAlbumsOptions,
  featuredMediaOptions,
  popularPhotosOptions,
} from '@/lib/query-options';

import MediaPage from '@/app-pages/media';

export default async function Page({ params }: PageProps<'/tribe/[tribe_id]/media'>) {
  const { tribe_id } = await params;

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery(tribeDetailOptions(tribe_id)),
    queryClient.prefetchQuery(featuredMediaOptions(tribe_id)),
    queryClient.prefetchQuery(popularPhotosOptions(tribe_id)),
    queryClient.prefetchQuery(popularAlbumsOptions(tribe_id)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MediaPage tribeId={tribe_id} />
    </HydrationBoundary>
  );
}
