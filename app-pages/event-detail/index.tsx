'use client'

import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { EventHeader } from './components/event-header'
import { EventInfoCard } from './components/event-info-card'
import { EventDescription } from './components/event-description'
import { EventCommentsSection } from './components/event-comments'
import { EventAttachmentsSection } from './components/event-attachments'
import { EventLocationMap } from './components/event-location'
import { EventPollsSection } from './components/event-polls'
import { EventAttendeesSection } from './components/event-attendees'
import { useEventDetail } from '@/lib/hooks/use-events'

interface EventDetailContentProps {
  tribeId: string
  eventId: string
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
 */
export function EventDetailContent({ tribeId, eventId }: EventDetailContentProps) {
  const { data: event, isLoading, error, isError, refetch } = useEventDetail(tribeId, eventId)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/tribe/${tribeId}`}>Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/tribe/${tribeId}/events`}>Events</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{event?.title || 'Event'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <EventHeader
          event={event}
          tribeId={tribeId}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => refetch()}
        />

        {/* Only render content if event exists or is loading */}
        {(event || isLoading) && (
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
                  <EventCommentsSection tribeId={tribeId} eventId={eventId} />
                </TabsContent>
                <TabsContent value="attachments" className="mt-6">
                  <EventAttachmentsSection eventId={eventId} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Location, Polls, Attendees */}
            <div className="lg:col-span-1 space-y-6">
              {/* Location Map */}
              {event?.location && <EventLocationMap location={event.location} isLoading={isLoading} />}

              {/* Polls Section */}
              <EventPollsSection tribeId={tribeId} eventId={eventId} />

              {/* Attendees */}
              <EventAttendeesSection tribeId={tribeId} eventId={eventId} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
