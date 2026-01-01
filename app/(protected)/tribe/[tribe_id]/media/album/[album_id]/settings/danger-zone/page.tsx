import { AlbumDangerZone } from '@/app-pages/album-settings/danger-zone';

export default async function AlbumDangerZonePage({
  params,
}: PageProps<'/tribe/[tribe_id]/media/album/[album_id]/settings/danger-zone'>) {
  const { tribe_id, album_id } = await params;

  return <AlbumDangerZone tribeId={tribe_id} albumId={album_id} />;
}
