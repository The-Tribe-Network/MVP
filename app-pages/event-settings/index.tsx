'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useEventDetail } from '@/lib/hooks/use-events'
import { EventSettingsNavigation } from './components/settings-navigation'
import { EventSettingsHeader } from './components/settings-header'
import { DetailsSection } from './details'
import { AttendeesSection } from './attendees'
import { RsvpSection } from './rsvp'
import { PollsSection } from './polls'
import { NotificationsSection } from './notifications'
import { MediaSection } from './media'
import { PermissionsSection } from './permissions'
import { DangerZoneSection } from './danger-zone'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EventSettingsContentProps {
  tribeId: string
  eventId: string
}

export type EventSettingsTab =
  | 'details'
  | 'attendees'
  | 'rsvp'
  | 'polls'
  | 'notifications'
  | 'media'
  | 'permissions'
  | 'danger-zone'

const validTabs: EventSettingsTab[] = [
  'details',
  'attendees',
  'rsvp',
  'polls',
  'notifications',
  'media',
  'permissions',
  'danger-zone',
]

export function EventSettingsContent({ tribeId, eventId }: EventSettingsContentProps) {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const initialTab = tabParam && validTabs.includes(tabParam as EventSettingsTab)
    ? (tabParam as EventSettingsTab)
    : 'details'

  const [activeTab, setActiveTab] = useState<EventSettingsTab>(initialTab)
  const { data: event, isLoading, isError, error, refetch } = useEventDetail(tribeId, eventId)

  // Update tab when URL param changes
  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam as EventSettingsTab)) {
      setActiveTab(tabParam as EventSettingsTab)
    }
  }, [tabParam])

  if (isLoading) {
    return <EventSettingsLoadingSkeleton />
  }

  if (isError || !event) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Failed to load event</h2>
            <p className="text-muted-foreground mb-4">
              {error?.message || 'Event not found or you do not have permission to access it.'}
            </p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'details':
        return <DetailsSection tribeId={tribeId} eventId={eventId} event={event} />
      case 'attendees':
        return <AttendeesSection tribeId={tribeId} eventId={eventId} />
      case 'rsvp':
        return <RsvpSection tribeId={tribeId} eventId={eventId} />
      case 'polls':
        return <PollsSection tribeId={tribeId} eventId={eventId} />
      case 'notifications':
        return <NotificationsSection tribeId={tribeId} eventId={eventId} />
      case 'media':
        return <MediaSection tribeId={tribeId} eventId={eventId} />
      case 'permissions':
        return <PermissionsSection tribeId={tribeId} eventId={eventId} />
      case 'danger-zone':
        return <DangerZoneSection tribeId={tribeId} eventId={eventId} event={event} />
      default:
        return <DetailsSection tribeId={tribeId} eventId={eventId} event={event} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
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
              <BreadcrumbLink asChild>
                <Link href={`/tribe/${tribeId}/events/${eventId}`}>{event.title}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Manage</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <EventSettingsHeader eventTitle={event.title} />

        {/* Main Content with Sidebar */}
        <div className="flex gap-8 mt-8">
          {/* Sidebar Navigation */}
          <EventSettingsNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  )
}

function EventSettingsLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Breadcrumb skeleton */}
        <Skeleton className="h-5 w-64 mb-6" />

        {/* Header skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="flex gap-8">
          {/* Sidebar skeleton */}
          <div className="w-64 space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>

          {/* Content skeleton */}
          <div className="flex-1 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
