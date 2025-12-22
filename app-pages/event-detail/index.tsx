'use client'

import { HydrationBoundary } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EventHeader } from './components/event-header'
import { EventInfoCard } from './components/event-info-card'
import { EventDescription } from './components/event-description'
import { EventCommentsSection } from './components/event-comments'
import { EventAttachmentsSection } from './components/event-attachments'
import { EventLocationMap } from './components/event-location'
import { EventPollsSection } from './components/event-polls'
import { EventAttendeesSection } from './components/event-attendees'
import { mockEvent } from './lib/mock-data'

interface EventDetailContentProps {
  tribeId: string
  eventId: string
  dehydratedState: any
}

/**
 * Event Detail Page - Root Component
 *
 * Thin wrapper that composes all event detail sections together.
 * Each section handles its own data fetching, loading, error, and empty states.
 *
 * Architecture Pattern:
 * - Root component: Layout and section composition only
 * - Section components: Handle data fetching and state management
 * - State components: Loading, error, empty states
 *
 * TODO: Replace mock data with real API integration using:
 * const { data: event, isLoading, error, isError, refetch } = useQuery(
 *   eventDetailOptions(eventId)
 * )
 */
export function EventDetailContent({ tribeId, eventId, dehydratedState }: EventDetailContentProps) {
  // TODO: Use real query hook
  // const { data: event, isLoading, error, isError, refetch } = useQuery(
  //   eventDetailOptions(eventId)
  // )

  const event = mockEvent
  const isLoading = false
  const isError = false
  const error = null

  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <EventHeader
            event={event}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={() => console.log('Retry loading event')}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Info Card */}
              <EventInfoCard event={event} isLoading={isLoading} />

              {/* Description */}
              <EventDescription event={event} isLoading={isLoading} />

              {/* Tabs for Comments and Attachments */}
              <Tabs defaultValue="discussion" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="discussion">Discussion</TabsTrigger>
                  <TabsTrigger value="attachments">Media & Links</TabsTrigger>
                </TabsList>
                <TabsContent value="discussion" className="mt-6">
                  <EventCommentsSection eventId={eventId} />
                </TabsContent>
                <TabsContent value="attachments" className="mt-6">
                  <EventAttachmentsSection eventId={eventId} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Location, Polls, Attendees */}
            <div className="lg:col-span-1 space-y-6">
              {/* Location Map */}
              {event.location && <EventLocationMap location={event.location} isLoading={isLoading} />}

              {/* Polls Section */}
              <EventPollsSection eventId={eventId} />

              {/* Attendees */}
              <EventAttendeesSection
                attendees={event.attendees}
                attendeeCount={event.attendeeCount}
                eventId={eventId}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </HydrationBoundary>
  )
}
