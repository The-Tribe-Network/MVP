export default async function NewAlbumPage({ params }: PageProps<'/tribe/[tribe_id]/media/album/new'>) {
  const { tribe_id } = await params

  return <div>New Album</div>
}