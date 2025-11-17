'use client'

import { MetricsGrid } from './metrics-grid'
import { ActivityFeed } from './activity-feed'
import { RecentMessages } from './recent-messages'
import { UpcomingEvents } from './upcoming-events'
import {
  mockActivities,
  mockMessages,
  mockUpcomingEvents,
  mockMetrics,
} from './mock-data'

export default function HomeDashboard() {
  return (
    <div className="flex-1 overflow-auto p-6 bg-background">
      <div className="mx-auto max-w-7xl space-y-6">
        <MetricsGrid metrics={mockMetrics} />

        <div className="grid gap-6 lg:grid-cols-3">
          <ActivityFeed activities={mockActivities} />

          <div className="space-y-6">
            <RecentMessages messages={mockMessages} />
            <UpcomingEvents events={mockUpcomingEvents} />
          </div>
        </div>
      </div>
    </div>
  )
}
