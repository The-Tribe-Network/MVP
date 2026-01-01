import { redirect } from 'next/navigation';

export default async function AlbumSettingsPage({
  params,
}: PageProps<'/tribe/[tribe_id]/media/album/[album_id]/settings'>) {
  const { tribe_id, album_id } = await params;

  return redirect(`/tribe/${tribe_id}/media/album/${album_id}/settings/details`);
}
