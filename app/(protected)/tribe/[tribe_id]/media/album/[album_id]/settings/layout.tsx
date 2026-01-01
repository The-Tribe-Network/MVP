import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { albumDetailOptions } from '@/lib/query-options/albums';
import { memberWithPermissionsOptions } from '@/lib/query-options/tribes';
import { AlbumSettingsNavigation } from '@/app-pages/album-settings/components/settings-navigation';
import { AlbumSettingsHeader } from '@/app-pages/album-settings/components/settings-header';

export default async function AlbumSettingsLayout({
  children,
  params,
}: LayoutProps<'/tribe/[tribe_id]/media/album/[album_id]/settings'>) {
  const { tribe_id, album_id } = await params;
  const queryClient = new QueryClient();

  // Prefetch album and permissions data for all settings pages
  await Promise.all([
    queryClient.prefetchQuery(albumDetailOptions(tribe_id, album_id)),
    queryClient.prefetchQuery(memberWithPermissionsOptions(tribe_id)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col">
        <AlbumSettingsHeader tribeId={tribe_id} albumId={album_id} />

        <div className="flex gap-8 mt-6">
          <div className="sticky self-start top-[72px]">
            <AlbumSettingsNavigation tribeId={tribe_id} albumId={album_id} />
          </div>
          <div className="flex-1 pb-12">{children}</div>
        </div>
      </div>
    </HydrationBoundary>
  );
}
