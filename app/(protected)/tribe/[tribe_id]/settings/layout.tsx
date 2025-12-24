import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { tribeDetailOptions } from '@/lib/query-options/tribes';
import { SettingsNavigation } from '@/app-pages/tribe-settings/components/settings-navigation';
import { SettingsHeader } from '@/app-pages/tribe-settings/components/settings-header';


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
      <div className="flex flex-col">
        <SettingsHeader tribeId={tribe_id} />

        <div className="flex gap-8 mt-6">
          <div className="sticky self-start top-[72px]">
            <SettingsNavigation tribeId={tribe_id} />
          </div>
          <div className="flex-1 pb-12">{children}</div>
        </div>
      </div>
    </HydrationBoundary>
  );
}

