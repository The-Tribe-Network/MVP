import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { tribeDetailOptions } from '@/lib/query-options/tribes';
import { SettingsNavigation } from '@/app-pages/tribe-settings/components/settings-navigation';


export default async function SettingsLayout({
  children,
  params,
}: LayoutProps<'/tribe/[tribe_id]/settings'>) {
  const { tribe_id } = await params;
  const queryClient = new QueryClient();

  // Prefetch tribe data for all settings pages
  await queryClient.prefetchQuery(tribeDetailOptions(tribe_id));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex gap-8">
        <SettingsNavigation tribeId={tribe_id} />
        <div className="flex-1">{children}</div>
      </div>
    </HydrationBoundary>
  );
}

