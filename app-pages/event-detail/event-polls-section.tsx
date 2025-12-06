"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Vote, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Users,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { CreatePollSheet } from "./create-poll-sheet"

export interface PollOption {
  id: string
  text: string
  votes: number
  voters: { id: string; name: string; image?: string | null }[]
}

export interface Poll {
  id: string
  question: string
  options: PollOption[]
  createdBy: {
    id: string
    name: string
    image?: string | null
  }
  createdAt: Date
  endsAt?: Date | null
  allowMultiple: boolean
  isAnonymous: boolean
  userVotes: string[] // option IDs the current user voted for
}

interface EventPollsSectionProps {
  eventId: string
  polls?: Poll[]
}

// Mock data for demonstration
const mockPolls: Poll[] = [
  {
    id: "poll-1",
    question: "What food should we order?",
    options: [
      { 
        id: "opt-1", 
        text: "Pizza 🍕", 
        votes: 12,
        voters: [
          { id: "u1", name: "Alex" },
          { id: "u2", name: "Sam" },
          { id: "u3", name: "Jordan" },
        ]
      },
      { 
        id: "opt-2", 
        text: "Tacos 🌮", 
        votes: 8,
        voters: [
          { id: "u4", name: "Taylor" },
          { id: "u5", name: "Morgan" },
        ]
      },
      { 
        id: "opt-3", 
        text: "Burgers 🍔", 
        votes: 5,
        voters: [
          { id: "u6", name: "Casey" },
        ]
      },
    ],
    createdBy: { id: "user-1", name: "Sarah Chen" },
    createdAt: new Date("2024-07-10"),
    endsAt: new Date("2024-07-14"),
    allowMultiple: false,
    isAnonymous: false,
    userVotes: ["opt-1"]
  },
  {
    id: "poll-2",
    question: "Best time to start the event?",
    options: [
      { 
        id: "opt-4", 
        text: "5:00 PM", 
        votes: 4,
        voters: []
      },
      { 
        id: "opt-5", 
        text: "6:00 PM", 
        votes: 15,
        voters: []
      },
      { 
        id: "opt-6", 
        text: "7:00 PM", 
        votes: 6,
        voters: []
      },
    ],
    createdBy: { id: "user-1", name: "Sarah Chen" },
    createdAt: new Date("2024-07-08"),
    endsAt: null,
    allowMultiple: false,
    isAnonymous: true,
    userVotes: []
  }
]

function PollCard({ poll, onVote }: { poll: Poll; onVote: (pollId: string, optionId: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0)
  const hasVoted = poll.userVotes.length > 0
  const isExpired = poll.endsAt ? new Date() > poll.endsAt : false

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      {/* Poll Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 flex-1">
          <h4 className="font-semibold text-sm leading-tight">{poll.question}</h4>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">
              by {poll.createdBy.name}
            </span>
            {poll.isAnonymous && (
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                Anonymous
              </Badge>
            )}
            {poll.allowMultiple && (
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                Multi-select
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <Users className="h-3.5 w-3.5" />
          <span>{totalVotes}</span>
        </div>
      </div>

      {/* Poll Options */}
      <div className="space-y-2">
        {poll.options.map((option) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
          const isSelected = poll.userVotes.includes(option.id)
          const canVote = !isExpired && (!hasVoted || poll.allowMultiple)

          return (
            <button
              key={option.id}
              onClick={() => canVote && onVote(poll.id, option.id)}
              disabled={!canVote && !isSelected}
              className={`
                w-full text-left transition-all rounded-md p-2.5 border
                ${isSelected 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                  : 'border-border hover:border-muted-foreground/30 hover:bg-muted/30'
                }
                ${!canVote && !isSelected ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  )}
                  <span className={`text-sm ${isSelected ? 'font-medium' : ''}`}>
                    {option.text}
                  </span>
                </div>
                {hasVoted && (
                  <span className="text-xs text-muted-foreground">
                    {Math.round(percentage)}%
                  </span>
                )}
              </div>
              {hasVoted && (
                <Progress 
                  value={percentage} 
                  className={`h-1.5 ${isSelected ? '[&>div]:bg-primary' : '[&>div]:bg-muted-foreground/40'}`}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Poll Footer */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-2">
          {poll.endsAt && (
            <div className={`flex items-center gap-1 text-xs ${isExpired ? 'text-destructive' : 'text-muted-foreground'}`}>
              <Clock className="h-3.5 w-3.5" />
              <span>
                {isExpired 
                  ? 'Ended' 
                  : `Ends ${poll.endsAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                }
              </span>
            </div>
          )}
        </div>
        
        {!poll.isAnonymous && totalVotes > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5 mr-1" />
                Hide voters
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5 mr-1" />
                Show voters
              </>
            )}
          </Button>
        )}
      </div>

      {/* Expanded Voters List */}
      {expanded && !poll.isAnonymous && (
        <div className="pt-2 border-t space-y-2">
          {poll.options.map((option) => (
            option.voters.length > 0 && (
              <div key={option.id} className="text-xs">
                <span className="font-medium">{option.text}:</span>{' '}
                <span className="text-muted-foreground">
                  {option.voters.map(v => v.name).join(', ')}
                </span>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  )
}

export function EventPollsSection({ eventId, polls = mockPolls }: EventPollsSectionProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [localPolls, setLocalPolls] = useState(polls)

  const handleVote = (pollId: string, optionId: string) => {
    setLocalPolls(prev => 
      prev.map(poll => {
        if (poll.id !== pollId) return poll
        
        // Toggle vote
        const hasVoted = poll.userVotes.includes(optionId)
        const newUserVotes = hasVoted 
          ? poll.userVotes.filter(id => id !== optionId)
          : poll.allowMultiple 
            ? [...poll.userVotes, optionId]
            : [optionId]

        // Update vote counts
        const newOptions = poll.options.map(opt => ({
          ...opt,
          votes: opt.id === optionId 
            ? (hasVoted ? opt.votes - 1 : opt.votes + 1)
            : (!poll.allowMultiple && poll.userVotes.length > 0 && !hasVoted && poll.userVotes[0] === opt.id)
              ? opt.votes - 1
              : opt.votes
        }))

        return {
          ...poll,
          options: newOptions,
          userVotes: newUserVotes
        }
      })
    )
  }

  const handleCreatePoll = (newPoll: Omit<Poll, 'id' | 'createdAt' | 'createdBy'>) => {
    const poll: Poll = {
      ...newPoll,
      id: `poll-${Date.now()}`,
      createdAt: new Date(),
      createdBy: { id: "current-user", name: "You" }
    }
    setLocalPolls(prev => [poll, ...prev])
    setIsCreateOpen(false)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Vote className="h-5 w-5" />
              Polls ({localPolls.length})
            </CardTitle>
            <Button 
              size="sm" 
              onClick={() => setIsCreateOpen(true)}
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Poll
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {localPolls.length === 0 ? (
            <div className="text-center py-8">
              <Vote className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground mb-1">No polls yet</p>
              <p className="text-xs text-muted-foreground">
                Create a poll to get everyone's opinion!
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-2">
              <div className="space-y-3">
                {localPolls.map((poll) => (
                  <PollCard 
                    key={poll.id} 
                    poll={poll} 
                    onVote={handleVote}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <CreatePollSheet 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen}
        onCreatePoll={handleCreatePoll}
      />
    </>
  )
}



