import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { mediaSettingsOptions, memberWithPermissionsOptions } from '@/lib/query-options/tribe-settings';
import { MediaSettings } from '@/app-pages/tribe-settings/media';

export default async function MediaSettingsPage({
  params,
}: {
  params: Promise<{ tribe_id: string }>;
}) {
  const { tribe_id } = await params;
  const queryClient = new QueryClient();

  // Prefetch media settings and member permissions in parallel
  await Promise.all([
    queryClient.prefetchQuery(mediaSettingsOptions(tribe_id)),
    queryClient.prefetchQuery(memberWithPermissionsOptions(tribe_id)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MediaSettings tribeId={tribe_id} />
    </HydrationBoundary>
  );
}
