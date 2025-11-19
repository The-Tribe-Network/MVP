'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarIcon, Clock, MapPin, Users, Plus, ThumbsUp, BarChart3, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function EventsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [userVotes, setUserVotes] = useState<Record<number, number>>({
    2: 1, // User voted for option 1 in event 2
  })

  const allEvents = [
    {
      id: 1,
      title: 'Summer BBQ Party',
      date: '2024-07-15',
      time: '6:00 PM',
      location: 'Central Park',
      attendees: 24,
      description: 'Join us for a fun summer BBQ with great food and games!',
      host: { name: 'Sarah Chen', avatar: '/placeholder.svg?height=40&width=40' },
      status: 'confirmed',
      hasVote: false,
      isAttending: true,
    },
    {
      id: 2,
      title: 'Movie Night - Vote for Movie!',
      date: '2024-07-20',
      time: '8:00 PM',
      location: "Jake's Place",
      attendees: 18,
      description: 'Vote for which movie we should watch this Friday!',
      host: { name: 'Jake Miller', avatar: '/placeholder.svg?height=40&width=40' },
      status: 'voting',
      hasVote: true,
      isAttending: false,
      voteDeadline: '2024-07-18',
      voteOptions: [
        { id: 1, title: 'Inception', votes: 12 },
        { id: 2, title: 'The Dark Knight', votes: 8 },
        { id: 3, title: 'Interstellar', votes: 6 },
      ],
    },
    {
      id: 3,
      title: 'Weekend Hiking Trip',
      date: '2024-07-22',
      time: '7:00 AM',
      location: 'Mountain Trail',
      attendees: 15,
      description: 'Early morning hike to catch the sunrise. Bring water and snacks!',
      host: { name: 'Alex Johnson', avatar: '/placeholder.svg?height=40&width=40' },
      status: 'confirmed',
      hasVote: false,
      isAttending: false,
    },
    {
      id: 4,
      title: 'Game Night - Choose Location',
      date: '2024-07-28',
      time: '7:30 PM',
      location: 'TBD',
      attendees: 20,
      description: 'Vote for where we should host game night this month!',
      host: { name: 'Emily Davis', avatar: '/placeholder.svg?height=40&width=40' },
      status: 'voting',
      hasVote: true,
      isAttending: true,
      voteDeadline: '2024-07-25',
      voteOptions: [
        { id: 1, title: "Mike's House", votes: 10 },
        { id: 2, title: "Community Center", votes: 15 },
        { id: 3, title: "Sarah's Apartment", votes: 5 },
      ],
    },
  ]

  const pastEvents = [
    {
      id: 5,
      title: 'Spring Picnic',
      date: '2024-06-10',
      time: '2:00 PM',
      location: 'Riverside Park',
      attendees: 32,
      description: 'Beautiful spring picnic with games and food.',
      host: { name: 'Mike Wilson', avatar: '/placeholder.svg?height=40&width=40' },
    },
    {
      id: 6,
      title: 'Board Game Tournament',
      date: '2024-06-05',
      time: '6:00 PM',
      location: 'Community Center',
      attendees: 28,
      description: 'Epic board game competition!',
      host: { name: 'Lisa Brown', avatar: '/placeholder.svg?height=40&width=40' },
    },
    {
      id: 7,
      title: 'Beach Volleyball',
      date: '2024-05-28',
      time: '4:00 PM',
      location: 'Sunset Beach',
      attendees: 20,
      description: 'Friendly volleyball matches by the beach.',
      host: { name: 'Chris Lee', avatar: '/placeholder.svg?height=40&width=40' },
    },
  ]

  // Dates with events for calendar highlighting
  const eventDates = [
    new Date(2024, 6, 15),
    new Date(2024, 6, 20),
    new Date(2024, 6, 22),
    new Date(2024, 6, 28),
  ]

  const handleVote = (eventId: number, optionId: number) => {
    setUserVotes(prev => ({
      ...prev,
      [eventId]: optionId
    }))
    console.log(`Voted for option ${optionId} in event ${eventId}`)
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/tribe/1">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Tribe Events</h1>
                <p className="text-muted-foreground">Plan and manage your tribe's events</p>
              </div>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                  <DialogDescription>
                    Plan a new event for your tribe. You can add voting options if you need input from members.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="event-title">Event Title</Label>
                    <Input id="event-title" placeholder="Summer BBQ Party" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event-date">Date</Label>
                      <Input id="event-date" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="event-time">Time</Label>
                      <Input id="event-time" type="time" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="event-location">Location</Label>
                    <Input id="event-location" placeholder="Central Park" />
                  </div>

                  <div>
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea
                      id="event-description"
                      placeholder="Tell members about the event..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="event-type">Event Type</Label>
                    <Select defaultValue="confirmed">
                      <SelectTrigger id="event-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmed Event</SelectItem>
                        <SelectItem value="voting">Needs Voting (Location, Time, etc.)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsCreateDialogOpen(false)}>
                      Create Event
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - All Events and Votes */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-semibold">All Events & Votes</h2>

              {allEvents.map((event) => {
                const hasUserVoted = userVotes[event.id] !== undefined
                const userVotedOption = userVotes[event.id]

                return (
                  <Card key={event.id} className="hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-xl">{event.title}</CardTitle>
                            {event.hasVote && (
                              <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">
                                <BarChart3 className="h-3 w-3 mr-1" />
                                Voting
                              </Badge>
                            )}
                            {hasUserVoted && (
                              <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Voted
                              </Badge>
                            )}
                            {event.isAttending && (
                              <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                                Going
                              </Badge>
                            )}
                          </div>
                          <CardDescription>{event.description}</CardDescription>
                        </div>
                        {!event.isAttending && (
                          <Button size="sm" variant="outline">
                            {event.hasVote ? 'Vote' : 'RSVP'}
                          </Button>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Event Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{event.attendees} attending</span>
                        </div>
                      </div>

                      {/* Host Info */}
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={event.host.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{event.host.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          Hosted by <span className="text-foreground font-medium">{event.host.name}</span>
                        </span>
                      </div>

                      {/* Voting Section */}
                      {event.hasVote && event.voteOptions && (
                        <div className="space-y-3 pt-2 border-t">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              {hasUserVoted ? 'Your Vote (click to change):' : 'Cast Your Vote:'}
                            </p>
                            {event.voteDeadline && (
                              <p className="text-xs text-muted-foreground">
                                Voting closes: {event.voteDeadline}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            {event.voteOptions.map((option) => {
                              const totalVotes = event.voteOptions!.reduce((sum, opt) => sum + opt.votes, 0)
                              const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
                              const isUserChoice = userVotedOption === option.id

                              return (
                                <button
                                  key={option.id}
                                  onClick={() => handleVote(event.id, option.id)}
                                  className="w-full group"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-sm font-medium group-hover:text-primary transition-colors ${isUserChoice ? 'text-primary' : ''}`}>
                                        {option.title}
                                      </span>
                                      {isUserChoice && (
                                        <CheckCircle2 className="h-4 w-4 text-primary" />
                                      )}
                                    </div>
                                    {hasUserVoted && (
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <ThumbsUp className="h-3 w-3" />
                                        <span>{option.votes} votes</span>
                                        <span className="text-xs">({Math.round(percentage)}%)</span>
                                      </div>
                                    )}
                                  </div>
                                  {hasUserVoted ? (
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                      <div
                                        className={`h-full transition-all ${isUserChoice ? 'bg-primary' : 'bg-primary/60 group-hover:bg-primary/80'}`}
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="h-2 bg-muted rounded-full group-hover:bg-muted/60 transition-colors" />
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Right Column - Calendar and Past Events */}
            <div className="lg:col-span-1 space-y-6">
              {/* Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle>Calendar</CardTitle>
                  <CardDescription>Events are highlighted</CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md"
                    modifiers={{
                      event: eventDates,
                    }}
                    modifiersClassNames={{
                      event: 'bg-primary/20 text-primary font-bold',
                    }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Past Events</CardTitle>
                  <CardDescription>Previous tribe events</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pastEvents.map((event) => (
                    <div key={event.id} className="space-y-2 pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {event.attendees}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Avatar className="h-3 w-3">
                            <AvatarImage src={event.host.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{event.host.name[0]}</AvatarFallback>
                          </Avatar>
                          <span>{event.host.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
