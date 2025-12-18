"use client"

import { HydrationBoundary } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CalendarIcon,
  Clock,
  MapPin,
  Users,
  Share2,
  MoreVertical,
  CheckCircle2,
  X
} from "lucide-react"
import { EventAttendeesSection } from "./event-attendees-section"
import { EventLocationMap } from "./event-location-map"
import { EventCommentsSection } from "./event-comments-section"
import { EventAttachmentsSection } from "./event-attachments-section"
import { EventPollsSection } from "./event-polls-section"
import type { EventWithDetails } from "@/lib/database/types"

interface EventDetailContentProps {
  tribeId: string
  eventId: string
  dehydratedState: any
}

// Mock data - will be replaced with real data from query
const mockEvent: EventWithDetails = {
  id: "1",
  title: "Summer BBQ Party",
  description: "Join us for a fun summer BBQ with great food, games, and amazing company! We'll have burgers, hot dogs, vegetarian options, and plenty of drinks. Bring your friends and family for a day of celebration.",
  location: "Central Park, New York, NY",
  startDate: new Date("2024-07-15T18:00:00"),
  endDate: new Date("2024-07-15T22:00:00"),
  status: "upcoming" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  tribeId: "tribe-1",
  createdBy: "user-1",
  creator: {
    id: "user-1",
    name: "Sarah Chen",
    email: "sarah@example.com",
    image: null,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  tribe: {
    id: "tribe-1",
    name: "Summer Fun Tribe",
    location: "New York, NY",
    createdAt: new Date(),
    updatedAt: new Date(),
    description: "A tribe for summer fun activities",
    avatar: null,
    privacy: "public" as const,
    category: "social" as const,
    isFeatured: false,
    isTrending: false,
    createdBy: "user-1"
  },
  attendees: [
    {
      id: "att-1",
      eventId: "1",
      userId: "user-2",
      status: "going",
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: "user-2",
        name: "John Doe",
        email: "john@example.com",
        image: null,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  ],
  attendeeCount: 24,
  isUserAttending: true
}

export function EventDetailContent({
  tribeId,
  eventId,
  dehydratedState
}: EventDetailContentProps) {
  // TODO: Use real query hook
  // const { data: event } = useQuery({
  //   queryKey: queryKeys.events.detail(eventId),
  //   queryFn: () => fetchEvent(eventId)
  // })

  const event = mockEvent

  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold">{event.title}</h1>
                <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                  {event.status}
                </Badge>
                {event.isUserAttending && (
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Attending
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                Hosted by <span className="text-foreground font-medium">{event.creator.name}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {event.isUserAttending ? (
                <Button variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel RSVP
                </Button>
              ) : (
                <Button size="sm">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  RSVP
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Info Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Date</p>
                        <p className="text-sm text-muted-foreground">
                          {event.startDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Time</p>
                        <p className="text-sm text-muted-foreground">
                          {event.startDate.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                          {event.endDate && ` - ${event.endDate.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Attendees</p>
                        <p className="text-sm text-muted-foreground">
                          {event.attendeeCount} people attending
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About this event</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {event.description}
                  </p>
                </CardContent>
              </Card>

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
              {event.location && (
                <EventLocationMap location={event.location} />
              )}

              {/* Polls Section */}
              <EventPollsSection eventId={eventId} />

              {/* Attendees */}
              <EventAttendeesSection
                attendees={event.attendees}
                attendeeCount={event.attendeeCount}
                eventId={eventId}
              />
            </div>
          </div>
        </div>
      </div>
    </HydrationBoundary>
  )
}
