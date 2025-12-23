'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Vote, Plus } from 'lucide-react'
import { PollCard } from './poll-card'
import { CreatePollSheet } from '../../create-poll-sheet'
import { EventPollsSkeleton } from './loading'
import { EventPollsError } from './error'
import { EventPollsEmpty } from './empty'
import { useEventPolls, useCreatePoll, useVotePoll, useRemoveVote } from '@/lib/hooks/use-polls'
import type { Poll } from '../../lib/types'
import type { PollWithDetails } from '@/lib/database/types'

interface EventPollsSectionProps {
  tribeId: string
  eventId: string
}

/**
 * Transform PollWithDetails from API to component Poll type
 */
function transformPoll(poll: PollWithDetails): Poll {
  return {
    id: poll.id,
    question: poll.question,
    options: poll.options.map((opt) => ({
      id: opt.id,
      text: opt.text,
      votes: opt.votes,
      voters: opt.voters.map((v) => ({
        id: v.id,
        name: v.name,
        image: v.image,
      })),
    })),
    createdBy: {
      id: poll.creator.id,
      name: poll.creator.name,
      image: poll.creator.image,
    },
    createdAt: poll.createdAt,
    endsAt: poll.endsAt,
    allowMultiple: poll.allowMultiple,
    isAnonymous: poll.isAnonymous,
    userVotes: poll.userVotes,
  }
}

/**
 * Event Polls Section
 *
 * Displays polls for the event with voting functionality
 */
export function EventPollsSection({ tribeId, eventId }: EventPollsSectionProps) {
  const { data: pollsData, isLoading, error, isError, refetch } = useEventPolls(tribeId, eventId)
  const { mutate: createPoll } = useCreatePoll()
  const { mutate: votePoll } = useVotePoll()
  const { mutate: removeVote } = useRemoveVote()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Transform PollWithDetails to component Poll type
  const polls = useMemo(() => {
    return pollsData?.map(transformPoll) || []
  }, [pollsData])

  const handleVote = (pollId: string, optionId: string) => {
    const poll = polls.find((p) => p.id === pollId)
    if (!poll) return

    const hasVoted = poll.userVotes.includes(optionId)

    if (hasVoted) {
      // Remove vote
      removeVote({
        tribeId,
        eventId,
        pollId,
        optionId,
      })
    } else {
      // Add vote
      if (poll.allowMultiple) {
        // Multiple votes allowed - add to existing votes
        votePoll({
          tribeId,
          eventId,
          pollId,
          optionIds: [...poll.userVotes, optionId],
        })
      } else {
        // Single vote - replace existing vote if any
        votePoll({
          tribeId,
          eventId,
          pollId,
          optionIds: [optionId],
        })
      }
    }
  }

  const handleCreatePoll = (newPoll: Omit<Poll, 'id' | 'createdAt' | 'createdBy'>) => {
    createPoll(
      {
        tribeId,
        eventId,
        data: {
          question: newPoll.question,
          options: newPoll.options.map((opt) => opt.text),
          allowMultiple: newPoll.allowMultiple,
          isAnonymous: newPoll.isAnonymous,
          endsAt: newPoll.endsAt ? newPoll.endsAt.toISOString() : undefined,
        },
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false)
        },
      }
    )
  }

  // Loading state
  if (isLoading) return <EventPollsSkeleton />

  // Error state
  if (isError) {
    return <EventPollsError message={error?.message} onRetry={() => refetch()} />
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Vote className="h-5 w-5" />
              Polls ({polls.length})
            </CardTitle>
            <Button size="sm" onClick={() => setIsCreateOpen(true)} className="h-8">
              <Plus className="h-4 w-4 mr-1" />
              New Poll
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {polls.length === 0 ? (
            <EventPollsEmpty onCreatePoll={() => setIsCreateOpen(true)} />
          ) : (
            <ScrollArea className="h-[400px] pr-2">
              <div className="space-y-3">
                {polls.map((poll) => (
                  <PollCard key={poll.id} poll={poll} onVote={handleVote} />
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
