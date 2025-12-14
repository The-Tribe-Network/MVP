"use client"

import { Vote } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PollQuestionInput } from "../components/poll-question-input"
import { PollOptionsList } from "../components/poll-options-list"

export interface PollData {
  question: string
  options: string[]
  allowMultiple: boolean
  isAnonymous: boolean
}

interface PollStepProps {
  includePoll: boolean
  poll: PollData
  onIncludePollChange: (value: boolean) => void
  onPollChange: (poll: PollData) => void
}

export function PollStep({
  includePoll,
  poll,
  onIncludePollChange,
  onPollChange
}: PollStepProps) {
  const addPollOption = () => {
    if (poll.options.length < 10) {
      onPollChange({ ...poll, options: [...poll.options, ""] })
    }
  }

  const removePollOption = (index: number) => {
    if (poll.options.length > 2) {
      onPollChange({
        ...poll,
        options: poll.options.filter((_, i) => i !== index)
      })
    }
  }

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...poll.options]
    newOptions[index] = value
    onPollChange({ ...poll, options: newOptions })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Vote className="h-5 w-5" />
          Add a Poll
          <Badge variant="outline" className="ml-2 font-normal">Optional</Badge>
        </CardTitle>
        <CardDescription>
          Create a poll to let attendees vote on event details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle to include poll */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
          <div className="space-y-0.5">
            <Label htmlFor="include-poll" className="text-base font-medium cursor-pointer">
              Include a poll with this event
            </Label>
            <p className="text-sm text-muted-foreground">
              Ask attendees to vote on something like food preferences or timing
            </p>
          </div>
          <Switch
            id="include-poll"
            checked={includePoll}
            onCheckedChange={onIncludePollChange}
          />
        </div>

        {includePoll && (
          <>
            <Separator />

            {/* Poll Question */}
            <PollQuestionInput
              value={poll.question}
              onChange={(value) => onPollChange({ ...poll, question: value })}
            />

            {/* Poll Options */}
            <PollOptionsList
              options={poll.options}
              onAdd={addPollOption}
              onRemove={removePollOption}
              onUpdate={updatePollOption}
            />

            <Separator />

            {/* Poll Settings */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Poll Settings</Label>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-multiple" className="text-sm font-normal cursor-pointer">
                    Allow multiple choices
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Let voters select more than one option
                  </p>
                </div>
                <Switch
                  id="allow-multiple"
                  checked={poll.allowMultiple}
                  onCheckedChange={(checked) => onPollChange({ ...poll, allowMultiple: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="anonymous" className="text-sm font-normal cursor-pointer">
                    Anonymous voting
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Hide who voted for each option
                  </p>
                </div>
                <Switch
                  id="anonymous"
                  checked={poll.isAnonymous}
                  onCheckedChange={(checked) => onPollChange({ ...poll, isAnonymous: checked })}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
