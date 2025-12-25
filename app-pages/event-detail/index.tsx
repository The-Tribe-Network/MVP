'use client'

import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { EventHeader } from './components/event-header'
import { EventCoverImage } from './components/event-cover-image'
import { EventDateDisplay } from './components/event-date-display'
import { EventTitleSection } from './components/event-title-section'
import { EventAttendeesInline } from './components/event-attendees-inline'
import { EventDescription } from './components/event-description'
import { EventTabs } from './components/event-tabs'
import { EventCommentsSection } from './components/event-comments'
import { EventRsvpStats } from './components/event-rsvp-stats'
import { EventLocationMap } from './components/event-location'
import { EventPollsSection } from './components/event-polls'
import { useEventDetail } from '@/lib/hooks/use-events'

interface EventDetailContentProps {
  tribeId: string
  eventId: string
}

/**
 * Event Detail Page - Root Component
 *
 * Clean, content-focused layout inspired by Party Pipes UI reference.
 * No card-heavy design - uses spacing and separators for sections.
 *
 * Layout:
 * - Header: Breadcrumbs + Action buttons (RSVP, Share, More)
 * - Left Column: Cover image, date/time, title, attendees, description, tabs
 * - Right Column: RSVP stats, location, polls
 */
export function EventDetailContent({ tribeId, eventId }: EventDetailContentProps) {
  const { data: event, isLoading, error, isError, refetch } = useEventDetail(tribeId, eventId)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Top Bar: Breadcrumb + Actions */}
        <div className="flex items-center justify-between">
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

          {/* Action Buttons (simplified header) */}
          <EventHeader
            event={event}
            tribeId={tribeId}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={() => refetch()}
          />
        </div>

        {/* Only render content if event exists or is loading */}
        {(event || isLoading) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cover Image (if exists) */}
              <EventCoverImage
                coverImageUrl={event?.coverImageUrl}
                title={event?.title || 'Event'}
                isLoading={isLoading}
              />

              {/* Date & Time Display */}
              {event && (
                <EventDateDisplay
                  startDate={event.startDate}
                  endDate={event.endDate}
                  isLoading={isLoading}
                />
              )}

              {/* Title, Host, Status Badges */}
              <EventTitleSection event={event} isLoading={isLoading} />

              {/* Inline Attendees */}
              <EventAttendeesInline tribeId={tribeId} eventId={eventId} />

              {/* Description */}
              <EventDescription event={event} isLoading={isLoading} />

              {/* Separator before tabs */}
              <Separator />

              {/* Underline Tabs: Discussion, Attachments, Timeline */}
              <EventTabs>
                <EventCommentsSection tribeId={tribeId} eventId={eventId} />
              </EventTabs>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* RSVP Stats */}
              <EventRsvpStats tribeId={tribeId} eventId={eventId} />

              <Separator />

              {/* Location Map */}
              {event?.location && (
                <EventLocationMap location={event.location} isLoading={isLoading} />
              )}

              {event?.location && <Separator />}

              {/* Polls Section */}
              <EventPollsSection tribeId={tribeId} eventId={eventId} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
