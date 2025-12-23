import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { eventsSettingsOptions } from '@/lib/query-options/tribe-settings';
import { EventsSettings } from '@/app-pages/tribe-settings/events';

export default async function EventsSettingsPage({
  params,
}: {
  params: Promise<{ tribe_id: string }>;
}) {
  const { tribe_id } = await params;
  const queryClient = new QueryClient();

  // Prefetch events settings data
  await queryClient.prefetchQuery(eventsSettingsOptions(tribe_id));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EventsSettings tribeId={tribe_id} />
    </HydrationBoundary>
  );
}
