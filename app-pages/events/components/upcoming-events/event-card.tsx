'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CalendarIcon, Clock, MapPin, Users, BarChart3, CheckCircle2, ArrowRight } from 'lucide-react'
import { EventVotingSection } from '../../../event-voting-section'
import Link from 'next/link'
import type { Event } from '../../lib/types'

interface EventCardProps {
  event: Event
  tribeId: string
  hasUserVoted: boolean
  userVotedOption?: number
  onVote: (eventId: number, optionId: number) => void
}

export function EventCard({ event, tribeId, hasUserVoted, userVotedOption, onVote }: EventCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors group relative">
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
          <EventVotingSection
            voteOptions={event.voteOptions}
            hasUserVoted={hasUserVoted}
            userVotedOption={userVotedOption}
            voteDeadline={event.voteDeadline}
            onVote={(optionId) => onVote(event.id, optionId)}
          />
        )}

        {/* View Details Link */}
        <div className="pt-2 border-t">
          <Link href={`/tribe/${tribeId}/events/${event.id}`}>
            <Button
              variant="ghost"
              className="w-full justify-between group-hover:bg-muted"
              size="sm"
            >
              <span>View Event Details</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
