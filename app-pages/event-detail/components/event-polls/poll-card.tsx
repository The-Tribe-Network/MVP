'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Clock, Users, ChevronDown, ChevronUp } from 'lucide-react'
import type { Poll } from '../../lib/types'

interface PollCardProps {
  poll: Poll
  onVote: (pollId: string, optionId: string) => void
}

export function PollCard({ poll, onVote }: PollCardProps) {
  const [expanded, setExpanded] = useState(false)
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0)
  const hasVoted = poll.userVotes.length > 0
  const isExpired = poll.endsAt ? new Date() > poll.endsAt : false

  const pollEndDate = poll.endsAt ? new Date(poll.endsAt) : null;
  console.log(poll.options);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      {/* Poll Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 flex-1">
          <h4 className="font-semibold text-sm leading-tight">{poll.question}</h4>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">by {poll.createdBy.name}</span>
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
                ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:border-muted-foreground/30 hover:bg-muted/30'
                }
                ${!canVote && !isSelected ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                  <span className={`text-sm ${isSelected ? 'font-medium' : ''}`}>{option.text}</span>
                </div>
                {hasVoted && <span className="text-xs text-muted-foreground">{Math.round(percentage)}%</span>}
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
          {pollEndDate && (
            <div
              className={`flex items-center gap-1 text-xs ${isExpired ? 'text-destructive' : 'text-muted-foreground'}`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>
                {isExpired
                  ? 'Ended'
                  : `Ends ${pollEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
              </span>
            </div>
          )}
        </div>

        {!poll.isAnonymous && totalVotes > 0 && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setExpanded(!expanded)}>
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
          {poll.options.map(
            (option) =>
              option.voters.length > 0 && (
                <div key={option.id} className="text-xs">
                  <span className="font-medium">{option.text}:</span>{' '}
                  <span className="text-muted-foreground">{option.voters.map((v) => v.name).join(', ')}</span>
                </div>
              )
          )}
        </div>
      )}
    </div>
  )
}
