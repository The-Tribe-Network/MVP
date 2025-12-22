import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';

import {
  tribeDetailOptions,
  tribeAlbumsOptions,
  tribeMediaOptions
} from '@/lib/query-options';
import { parsePaginationParams } from '@/lib/utils';

import MediaPage from '@/app-pages/media';

export default async function Page({ params, searchParams }: PageProps<'/tribe/[tribe_id]/media'>) {
  const { tribe_id } = await params;
  const { limit: limitParam = '50', offset: offsetParam = '0' } = await searchParams;

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery(tribeDetailOptions(tribe_id)),
    queryClient.prefetchQuery(tribeAlbumsOptions(tribe_id)),
    queryClient.prefetchQuery(tribeMediaOptions(tribe_id, parsePaginationParams(limitParam, offsetParam))),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MediaPage tribeId={tribe_id} />
    </HydrationBoundary>
  );
}
