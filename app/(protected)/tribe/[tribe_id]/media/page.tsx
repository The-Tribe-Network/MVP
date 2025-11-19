import { MediaHeader } from '@/app-pages/media/media-header'
import { TrendingSection } from '@/app-pages/media/trending-section'
import { AllAlbumsSection } from '@/app-pages/media/all-albums-section'
import { Album, Photo } from '@/app-pages/media/types'

interface AlbumsPageProps {
  params: Promise<{ tribe_id: string }>
}

// TODO: Replace with actual data fetching from database
async function getMediaData(): Promise<{
  trendyAlbums: Album[]
  trendyPhotos: Photo[]
  allAlbums: Album[]
}> {
  // Fetch dummy photos from JSONPlaceholder API
  const photosResponse = await fetch('https://jsonplaceholder.typicode.com/photos?_limit=12', {
    next: { revalidate: 3600 } // Revalidate every hour
  })

  if (!photosResponse.ok) {
    throw new Error('Failed to fetch photos')
  }

  const photosData = await photosResponse.json()

  // Generate dates for trending photos
  const dates = ['Aug 15, 2024', 'Jul 22, 2024', 'Sep 3, 2024', 'Aug 10, 2024', 'Jul 18, 2024', 'Sep 1, 2024']
  const likes = [142, 98, 87, 156, 124, 92]
  const comments = [23, 17, 12, 28, 21, 15]

  // Map API photos to our Photo type
  const trendyPhotos: Photo[] = photosData.slice(0, 6).map((photo: any, index: number) => ({
    id: photo.id,
    url: photo.url,
    likes: likes[index] || Math.floor(Math.random() * 200) + 50,
    comments: comments[index] || Math.floor(Math.random() * 30) + 10,
    date: dates[index] || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }))

  // Generate album covers from photos
  const albumCovers = photosData.slice(6, 15).map((photo: any) => photo.url)

  // Album names
  const albumNames = [
    'Summer Vibes 2024',
    'Beach Day Adventures',
    'Game Night Chronicles',
    'Mountain Hiking Trip',
    'Birthday Celebration',
    'Holiday Memories',
    'Coffee Meetups',
    'Road Trip 2024',
    'New Year Party'
  ]

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const albumDates = ['Aug 2024', 'Jul 2024', 'Sep 2024', 'Jun 2024', 'May 2024', 'Dec 2023', 'Apr 2024', 'Mar 2024', 'Jan 2024']
  const photoCounts = [47, 32, 28, 56, 41, 63, 18, 89, 52]

  const trendyAlbums: Album[] = albumNames.slice(0, 3).map((name, index) => ({
    id: index + 1,
    name,
    cover: albumCovers[index] || `https://picsum.photos/400/300?random=${index + 1}`,
    photoCount: photoCounts[index],
    date: albumDates[index],
    trending: true
  }))

  const allAlbums: Album[] = albumNames.map((name, index) => ({
    id: index + 1,
    name,
    cover: albumCovers[index] || `https://picsum.photos/400/300?random=${index + 1}`,
    photoCount: photoCounts[index],
    date: albumDates[index],
    trending: index < 3
  }))

  return {
    trendyAlbums,
    trendyPhotos,
    allAlbums
  }
}

export default async function AlbumsPage({ params }: AlbumsPageProps) {
  await params // Access params to ensure it's awaited
  const { trendyAlbums, trendyPhotos, allAlbums } = await getMediaData()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 mt-16">
        <MediaHeader />

        <TrendingSection albums={trendyAlbums} photos={trendyPhotos} />

        <AllAlbumsSection albums={allAlbums} />
      </div>
    </div>
  )
}
