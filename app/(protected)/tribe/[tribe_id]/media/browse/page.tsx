import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';

import {
  tribeDetailOptions,
  tribeAlbumsOptions,
  tribeMediaOptions,
} from '@/lib/query-options';

import MediaBrowsePage from '@/app-pages/media-browse';

interface PageProps {
  params: Promise<{ tribe_id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { tribe_id } = await params;

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery(tribeDetailOptions(tribe_id)),
    queryClient.prefetchQuery(tribeAlbumsOptions(tribe_id)),
    queryClient.prefetchQuery(tribeMediaOptions(tribe_id)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MediaBrowsePage tribeId={tribe_id} />
    </HydrationBoundary>
  );
}
