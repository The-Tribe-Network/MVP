import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { membersWithPermissionsOptions } from '@/lib/query-options/permissions';
import { PermissionsSettings } from '@/app-pages/tribe-settings/permissions';

export default async function Page({
  params,
}: PageProps<'/tribe/[tribe_id]/settings/permissions'>) {
  const { tribe_id } = await params;
  const queryClient = new QueryClient();

  // Prefetch members with custom permission overrides
  await queryClient.prefetchQuery(membersWithPermissionsOptions(tribe_id));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PermissionsSettings tribeId={tribe_id} />
    </HydrationBoundary>
  );
}
