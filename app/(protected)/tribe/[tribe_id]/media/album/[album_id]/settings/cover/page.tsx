import { AlbumCover } from '@/app-pages/album-settings/cover';

export default async function AlbumCoverPage({
  params,
}: PageProps<'/tribe/[tribe_id]/media/album/[album_id]/settings/cover'>) {
  const { tribe_id, album_id } = await params;

  return <AlbumCover tribeId={tribe_id} albumId={album_id} />;
}
