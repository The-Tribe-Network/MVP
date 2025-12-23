import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { tribeGeneralSettingsOptions } from '@/lib/query-options/tribe-settings';
import { GeneralSettings } from '@/app-pages/tribe-settings/general';

export default async function GeneralSettingsPage({
  params,
}: {
  params: Promise<{ tribe_id: string }>;
}) {
  const { tribe_id } = await params;
  const queryClient = new QueryClient();

  // Prefetch general settings data
  await queryClient.prefetchQuery(tribeGeneralSettingsOptions(tribe_id));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GeneralSettings tribeId={tribe_id} />
    </HydrationBoundary>
  );
}

