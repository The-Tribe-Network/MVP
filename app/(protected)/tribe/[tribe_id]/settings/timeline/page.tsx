import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { timelineSettingsOptions } from '@/lib/query-options/tribe-settings';
import { TimelineSettings } from '@/app-pages/tribe-settings/timeline';

type PageProps = {
  params: Promise<{ tribe_id: string }>;
};

export default async function TimelineSettingsPage({ params }: PageProps) {
  const { tribe_id } = await params;
  const queryClient = new QueryClient();

  // Prefetch timeline settings
  await queryClient.prefetchQuery(timelineSettingsOptions(tribe_id));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TimelineSettings tribeId={tribe_id} />
    </HydrationBoundary>
  );
}
