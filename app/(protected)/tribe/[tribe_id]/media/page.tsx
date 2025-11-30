import { MediaPageClient } from '@/app-pages/media'

interface AlbumsPageProps {
  params: Promise<{ tribe_id: string }>
}

export default async function AlbumsPage({ params }: AlbumsPageProps) {
  const { tribe_id } = await params

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 mt-16">
        <MediaPageClient tribeId={tribe_id} />
      </div>
    </div>
  )
}
