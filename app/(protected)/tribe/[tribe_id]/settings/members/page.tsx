import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { tribeMembersListOptions } from '@/lib/query-options/members';
import { memberWithPermissionsOptions } from '@/lib/query-options/tribe-settings';
import { MembersSettings } from '@/app-pages/tribe-settings/members';

export default async function MembersSettingsPage({
  params,
}: {
  params: Promise<{ tribe_id: string }>;
}) {
  const { tribe_id } = await params;
  const queryClient = new QueryClient();

  // Prefetch members list and current user permissions IN PARALLEL
  await Promise.all([
    queryClient.prefetchQuery(
      tribeMembersListOptions(tribe_id, { page: 1, pageSize: 50 })
    ),
    queryClient.prefetchQuery(memberWithPermissionsOptions(tribe_id)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MembersSettings tribeId={tribe_id} />
    </HydrationBoundary>
  );
}
