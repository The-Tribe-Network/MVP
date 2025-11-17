import type { PageProps } from '@/.next/types/app/page'
import TribeInfoWidget, { mockTribeInfoWidgetData } from '@/components/dashboard-widgets/info'
import AlbumsWidget, { mockAlbumsWidgetData } from '@/components/dashboard-widgets/albums'
import EventsWidget, { eventsWidgetMockData } from '@/components/dashboard-widgets/events'
import TrendingWidget, { trendingWidgetMockData } from '@/components/dashboard-widgets/trending'
import TimelineWidget, { mockTimelineData } from '@/components/dashboard-widgets/timeline'

export default async function TribeDashboardPage({ params }: PageProps) {
  const { tribe_id } = await params

  return (
    <div className="min-h-screen bg-background">
      {/* <Toolbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} /> */}

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Tribe Info */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="space-y-6 sticky top-6">
              <TribeInfoWidget {...mockTribeInfoWidgetData} />
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
