'use client'

import { CheckCircle2, ThumbsUp } from 'lucide-react'

// Local UI type for vote options
interface VoteOption {
  id: number
  title: string
  votes: number
}

interface EventVotingSectionProps {
  voteOptions: VoteOption[]
  hasUserVoted: boolean
  userVotedOption?: number
  voteDeadline?: string
  onVote: (optionId: number) => void
}

export function EventVotingSection({
  voteOptions,
  hasUserVoted,
  userVotedOption,
  voteDeadline,
  onVote
}: EventVotingSectionProps) {
  const totalVotes = voteOptions.reduce((sum, opt) => sum + opt.votes, 0)

  return (
    <div className="space-y-3 pt-2 border-t">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {hasUserVoted ? 'Your Vote (click to change):' : 'Cast Your Vote:'}
        </p>
        {voteDeadline && (
          <p className="text-xs text-muted-foreground">
            Voting closes: {voteDeadline}
          </p>
        )}
      </div>
      <div className="space-y-2">
        {voteOptions.map((option) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
          const isUserChoice = userVotedOption === option.id

          return (
            <button
              key={option.id}
              onClick={() => onVote(option.id)}
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
  )
}

