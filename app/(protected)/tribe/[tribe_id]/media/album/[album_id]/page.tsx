import { AlbumDetailClient } from "@/app-pages/album"
import { notFound } from "next/navigation"

export default async function AlbumPage({ params }: PageProps<'/tribe/[tribe_id]/media/album/[album_id]'>) {
  const { tribe_id, album_id } = await params

  if (!tribe_id || !album_id) {
    notFound()
  }

  return <AlbumDetailClient tribeId={tribe_id} albumId={album_id} />
}