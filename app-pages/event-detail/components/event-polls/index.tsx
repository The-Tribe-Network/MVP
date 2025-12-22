'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Vote, Plus } from 'lucide-react'
import { PollCard } from './poll-card'
import { CreatePollSheet } from '../../create-poll-sheet'
import { EventPollsSkeleton } from './loading'
import { EventPollsError } from './error'
import { EventPollsEmpty } from './empty'
import { mockPolls } from '../../lib/mock-data'
import type { Poll } from '../../lib/types'

interface EventPollsSectionProps {
  eventId: string
}

/**
 * Event Polls Section
 *
 * Displays polls for the event with voting functionality
 *
 * TODO: Replace mock data with real API integration using:
 * const { data: polls, isLoading, error, isError, refetch } = useQuery(
 *   eventPollsOptions(eventId)
 * )
 * const { mutate: createPoll } = useCreateEventPoll()
 * const { mutate: votePoll } = useVoteEventPoll()
 */
export function EventPollsSection({ eventId }: EventPollsSectionProps) {
  // Mock state management (for demonstration)
  const isLoading = false
  const isError = false
  const error = null
  const [localPolls, setLocalPolls] = useState<Poll[]>(mockPolls)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const handleVote = (pollId: string, optionId: string) => {
    setLocalPolls((prev) =>
      prev.map((poll) => {
        if (poll.id !== pollId) return poll

        // Toggle vote
        const hasVoted = poll.userVotes.includes(optionId)
        const newUserVotes = hasVoted
          ? poll.userVotes.filter((id) => id !== optionId)
          : poll.allowMultiple
            ? [...poll.userVotes, optionId]
            : [optionId]

        // Update vote counts
        const newOptions = poll.options.map((opt) => ({
          ...opt,
          votes:
            opt.id === optionId
              ? hasVoted
                ? opt.votes - 1
                : opt.votes + 1
              : !poll.allowMultiple &&
                  poll.userVotes.length > 0 &&
                  !hasVoted &&
                  poll.userVotes[0] === opt.id
                ? opt.votes - 1
                : opt.votes,
        }))

        return {
          ...poll,
          options: newOptions,
          userVotes: newUserVotes,
        }
      })
    )

    // TODO: Call votePoll({ pollId, optionId })
    console.log('Voting on poll:', pollId, 'option:', optionId)
  }

  const handleCreatePoll = (newPoll: Omit<Poll, 'id' | 'createdAt' | 'createdBy'>) => {
    const poll: Poll = {
      ...newPoll,
      id: `poll-${Date.now()}`,
      createdAt: new Date(),
      createdBy: { id: 'current-user', name: 'You' },
    }
    setLocalPolls((prev) => [poll, ...prev])
    setIsCreateOpen(false)

    // TODO: Call createPoll({ eventId, ...newPoll })
    console.log('Creating poll:', newPoll)
  }

  // Loading state
  if (isLoading) return <EventPollsSkeleton />

  // Error state
  if (isError) {
    return (
      <EventPollsError message={error?.message} onRetry={() => console.log('Retry loading polls')} />
    )
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
            <Button size="sm" onClick={() => setIsCreateOpen(true)} className="h-8">
              <Plus className="h-4 w-4 mr-1" />
              New Poll
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {localPolls.length === 0 ? (
            <EventPollsEmpty onCreatePoll={() => setIsCreateOpen(true)} />
          ) : (
            <ScrollArea className="h-[400px] pr-2">
              <div className="space-y-3">
                {localPolls.map((poll) => (
                  <PollCard key={poll.id} poll={poll} onVote={handleVote} />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <CreatePollSheet open={isCreateOpen} onOpenChange={setIsCreateOpen} onCreatePoll={handleCreatePoll} />
    </>
  )
}
