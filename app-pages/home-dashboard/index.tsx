import {
  DashboardHeader,
  ActivityFeed,
  MetricsGrid,
  RecentMessages,
  UpcomingEvents,
} from './components'
import {
  mockMessages,
  mockUpcomingEvents,
  mockMetrics,
} from './mock/data'
import type { User } from 'better-auth'

interface HomeDashboardProps {
  user: User;
}

export default function HomeDashboard({ user }: HomeDashboardProps) {
  return (
    <div className="flex-1 overflow-auto pt-9 bg-background">
      <DashboardHeader userName={user?.name} />

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
