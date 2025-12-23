import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { rolePermissionsOptions } from "@/lib/query-options/permissions";
import { RolesSettings } from "@/app-pages/tribe-settings/roles";

export default async function RolesSettingsPage({
  params,
}: {
  params: Promise<{ tribe_id: string }>;
}) {
  const { tribe_id } = await params;
  const queryClient = new QueryClient();

  // Prefetch role permissions data
  await queryClient.prefetchQuery(rolePermissionsOptions(tribe_id));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RolesSettings tribeId={tribe_id} />
    </HydrationBoundary>
  );
}
