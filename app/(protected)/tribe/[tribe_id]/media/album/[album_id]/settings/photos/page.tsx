import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { albumDetailOptions } from '@/lib/query-options/albums';
import { tribeMediaOptions } from '@/lib/query-options/media';
import { AlbumPhotos } from '@/app-pages/album-settings/photos';

export default async function AlbumPhotosPage({
  params,
}: PageProps<'/tribe/[tribe_id]/media/album/[album_id]/settings/photos'>) {
  const { tribe_id, album_id } = await params;
  const queryClient = new QueryClient();

  // Prefetch album and tribe media
  await Promise.all([
    queryClient.prefetchQuery(albumDetailOptions(tribe_id, album_id)),
    queryClient.prefetchQuery(tribeMediaOptions(tribe_id, { type: 'image' })),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AlbumPhotos tribeId={tribe_id} albumId={album_id} />
    </HydrationBoundary>
  );
}
