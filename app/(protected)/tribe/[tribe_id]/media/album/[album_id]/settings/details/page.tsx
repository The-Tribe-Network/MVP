import { AlbumDetails } from '@/app-pages/album-settings/details';

export default async function AlbumDetailsPage({
  params,
}: PageProps<'/tribe/[tribe_id]/media/album/[album_id]/settings/details'>) {
  const { tribe_id, album_id } = await params;

  return <AlbumDetails tribeId={tribe_id} albumId={album_id} />;
}
