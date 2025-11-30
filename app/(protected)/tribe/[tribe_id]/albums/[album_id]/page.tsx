import { AlbumDetailClient } from '@/app-pages/album';
import { notFound, redirect } from 'next/navigation';

export default async function AlbumPage({ params }: PageProps<'/tribe/[tribe_id]/media/album/[album_id]'>) {
  const { tribe_id, album_id } = await params

  if (!album_id) {
    if (tribe_id) {
      redirect(`/tribe/${tribe_id}/media`)
    } else {
      redirect('/dashboard')
    }
  }

  if (!tribe_id) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 mt-16">
        <AlbumDetailClient tribeId={tribe_id} albumId={album_id} />
      </div>
    </div>
  )
}
