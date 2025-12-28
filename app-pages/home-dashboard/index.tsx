import {
  DashboardHeader,
  ActivityFeed,
  RecentMessages,
  UpcomingEvents,
} from './components'
import {
  mockMessages,
  mockUpcomingEvents,
} from './mock/data'
import type { User } from 'better-auth'

interface HomeDashboardProps {
  user: User;
}

export default function HomeDashboard({ user }: HomeDashboardProps) {
  return (
    <div className="flex-1 overflow-auto pt-9 bg-background">
      <DashboardHeader userName={user?.name} />

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/*
          On mobile: Hide messages/events completely
          On tablet (md): Show messages/events ABOVE activity feed (stacked)
          On desktop (lg): Show messages/events in sidebar
        */}

        {/* Tablet layout: Messages/Events on top (md only, hidden on mobile and lg+) */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-6 lg:hidden col-span-full">
          <RecentMessages messages={mockMessages} />
          <UpcomingEvents events={mockUpcomingEvents} />
        </div>

        {/* Activity Feed - full width on mobile/tablet, 2 cols on desktop */}
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>

        {/* Desktop sidebar: Messages/Events (hidden on mobile and tablet) */}
        <div className="hidden lg:block space-y-6">
          <RecentMessages messages={mockMessages} />
          <UpcomingEvents events={mockUpcomingEvents} />
        </div>
      </div>
    </div>
  )
}
