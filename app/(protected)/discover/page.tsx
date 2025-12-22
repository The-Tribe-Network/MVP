import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';

import {
  discoverTribesOptions,
  featuredTribesOptions,
} from '@/lib/query-options';

import DiscoverPageContent from '@/app-pages/discover';

export default async function DiscoverPage() {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery(featuredTribesOptions()),
    queryClient.prefetchQuery(discoverTribesOptions()),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DiscoverPageContent />
    </HydrationBoundary>
  );
}
