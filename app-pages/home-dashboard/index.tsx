import { MetricsGrid } from './metrics-grid'
import { ActivityFeed } from './activity-feed'
import { RecentMessages } from './recent-messages'
import { UpcomingEvents } from './upcoming-events'
import {
  mockMessages,
  mockUpcomingEvents,
  mockMetrics,
} from './mock-data'
import { getFirstName } from '@/lib/utils'
import type { User } from 'better-auth'

interface HomeDashboardProps {
  user: User;
}

export default async function HomeDashboard({ user }: HomeDashboardProps) {
  const firstName = getFirstName(user?.name);

  return (
    <div className="flex-1 overflow-auto pt-9 bg-background">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Home</h1>
        <p className="text-muted-foreground">Welcome {firstName} to your home dashboard</p>
      </div>
      <div className="mx-auto space-y-6">
        <MetricsGrid metrics={mockMetrics} />

        <div className="grid gap-6 lg:grid-cols-3">
          <ActivityFeed />

          <div className="space-y-6">
            <RecentMessages messages={mockMessages} />
            <UpcomingEvents events={mockUpcomingEvents} />
          </div>
        </div>
      </div>
    </div>
  )
}
