import type { PageProps } from '@/.next/types/app/page'
import { notFound } from 'next/navigation'
import TribeInfoWidget from '@/components/dashboard-widgets/info'
import AlbumsWidget, { mockAlbumsWidgetData } from '@/components/dashboard-widgets/albums'
import EventsWidget, { eventsWidgetMockData } from '@/components/dashboard-widgets/events'
import TrendingWidget, { trendingWidgetMockData } from '@/components/dashboard-widgets/trending'
import TimelineWidget, { mockTimelineData } from '@/components/dashboard-widgets/timeline'
import { getTribeById } from '@/lib/services/tribe'
import { requireAuth } from '@/lib/services/auth'

export default async function TribeDashboardPage({ params }: PageProps) {
  const { tribe_id } = await params

  // Ensure user is authenticated
  await requireAuth()

  // Fetch tribe data server-side
  const tribeData = await getTribeById(tribe_id)

  if (!tribeData) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* <Toolbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} /> */}

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Tribe Info */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="space-y-6 sticky top-6">
              <TribeInfoWidget
                tribeName={tribeData.name}
                tribeDescription={tribeData.description || ''}
                tribeMembers={tribeData.memberCount}
                {...(tribeData.avatar && { tribeAvatar: tribeData.avatar })}
              />
              <AlbumsWidget photoAlbum={mockAlbumsWidgetData} />
            </div>
          </div>

          {/* Middle Column - Timeline */}
          <div className="lg:col-span-6">
            <TimelineWidget initialPosts={mockTimelineData} />
          </div>

          {/* Right Column - Trends & Events */}
          <div className="lg:col-span-3 space-y-6">
            <TrendingWidget trends={trendingWidgetMockData} />
            <EventsWidget events={eventsWidgetMockData} />
          </div>
        </div>
      </div>
    </div>
  )
}
