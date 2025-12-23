import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';

import { albumDetailOptions } from '@/lib/query-options';
import AlbumPage from '@/app-pages/album';

export default async function Page({ params }: PageProps<'/tribe/[tribe_id]/media/album/[album_id]'>) {
  const { tribe_id, album_id } = await params;

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(albumDetailOptions(tribe_id, album_id));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AlbumPage tribeId={tribe_id} albumId={album_id} />
    </HydrationBoundary>
  );
}
