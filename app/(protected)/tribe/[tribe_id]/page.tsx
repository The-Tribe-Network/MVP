import {
  HydrationBoundary,
  QueryClient,
  dehydrate
} from '@tanstack/react-query'

import {
  tribePostsOptions,
  tribeMediaOptions,
  tribeDetailOptions
} from '@/lib/query-options';
import { parsePaginationParams } from '@/lib/utils'

import { TribeDashboardPage } from '@/app-pages/tribe-dashboard'

export default async function Page({
  params,
  searchParams
}: PageProps<'/tribe/[tribe_id]'>) {
  const { tribe_id } = await params;
  const { limit: limitParam = '20', offset: offsetParam = '0' } = await searchParams;

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery(tribeDetailOptions(tribe_id)),
    queryClient.prefetchQuery(tribePostsOptions(tribe_id, parsePaginationParams(limitParam, offsetParam))),
    queryClient.prefetchQuery(tribeMediaOptions(tribe_id, {
      type: 'image',
      limit: 4,
      offset: 0,
    }))
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TribeDashboardPage tribeId={tribe_id} />
    </HydrationBoundary>
  );
}
