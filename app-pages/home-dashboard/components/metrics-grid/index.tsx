import { MetricCard } from './metric-card'
import type { Metric } from '../../lib/types'
import type { Announcement } from '../../lib/types'
import AnnouncementsCarousel from '../announcements-carousel'

interface MetricsGridProps {
  metrics: Metric[]
  announcements?: Announcement[]
}

export default function MetricsGrid({ metrics, announcements = [] }: MetricsGridProps) {
  // Metrics order: [Upcoming Events, Unread Messages, Active Tribes, Total Members]
  // Mobile (xs): Show only 1 metric (Upcoming Events)
  // Small (sm): Show 2 metrics (Upcoming Events, Unread Messages)
  // Medium+ (md/lg/xl): Show 2 metrics + Announcements carousel

  return (
    <div className="space-y-4">
      {/* Desktop: 2 metrics + announcements carousel */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* First metric - always visible */}
        <div className="block">
          <MetricCard metric={metrics[0]} />
        </div>

        {/* Second metric - hidden on xs, visible on sm+ */}
        <div className="hidden sm:block">
          <MetricCard metric={metrics[1]} />
        </div>

        {/* Announcements carousel - only on lg+ screens */}
        {announcements.length > 0 && (
          <div className="hidden lg:block">
            <AnnouncementsCarousel announcements={announcements} />
          </div>
        )}
      </div>
    </div>
  )
}

