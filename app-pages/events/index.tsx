'use client'

import { EventsHeader } from './events-header'
import { UpcomingEvents } from './components/upcoming-events'
import { EventsCalendar } from './components/events-calendar'
import { PastEvents } from './components/past-events'

interface EventsPageProps {
  tribeId: string
}

/**
 * Events Page - Root Component
 *
 * Thin wrapper that composes all event sections together.
 * Each section handles its own data fetching, loading, error, and empty states.
 *
 * Architecture Pattern:
 * - Root component: Layout and section composition only
 * - Section components: Handle data fetching and state management
 * - State components: Loading, error, empty states
 */
export default function EventsPage({ tribeId }: EventsPageProps) {
  return (
    <div className="flex h-screen">
      <div className="flex-1">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <EventsHeader tribeId={tribeId} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Upcoming Events */}
            <div className="lg:col-span-2">
              <UpcomingEvents tribeId={tribeId} />
            </div>

            {/* Right Column - Calendar & Past Events */}
            <div className="lg:col-span-1 space-y-6">
              <EventsCalendar tribeId={tribeId} />
              <PastEvents tribeId={tribeId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
