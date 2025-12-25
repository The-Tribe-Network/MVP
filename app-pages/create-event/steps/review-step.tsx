"use client"

import { format } from "date-fns"
import { Check, Vote } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { CreateEventWithPollInput } from "@/lib/validations/event"

interface ReviewStepProps {
  formData: CreateEventWithPollInput
}

export function ReviewStep({ formData }: ReviewStepProps) {
  const poll = formData.poll
  const includePoll = poll !== null && poll !== undefined

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Check className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Review & Submit</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Review your event details before submitting
        </p>
      </div>
        <div className="space-y-4">
          {/* Cover Image Preview */}
          {formData.coverImageUrl && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Cover Image
              </h3>
              <img
                src={formData.coverImageUrl}
                alt="Event cover"
                className="w-full h-48 object-cover rounded-lg border"
              />
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Event Title
            </h3>
            <p className="text-lg font-semibold">
              {formData.title || "No title provided"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Description
            </h3>
            <p className="text-sm">
              {formData.description || "No description provided"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Start Date
              </h3>
              <p className="text-sm">
                {formData.startDate
                  ? format(formData.startDate, "PPP 'at' p")
                  : "No start date provided"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                End Date
              </h3>
              <p className="text-sm">
                {formData.endDate
                  ? format(formData.endDate, "PPP 'at' p")
                  : "Not specified"}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Location
            </h3>
            <p className="text-sm">
              {formData.location || "No location provided"}
            </p>
          </div>

          {/* Poll Summary */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Poll
            </h3>
            {includePoll && poll.question?.trim() ? (
              <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Vote className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">{poll.question}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {poll.options?.filter(opt => opt.trim()).map((option, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {option}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {poll.allowMultiple && <span>• Multiple choice</span>}
                  {poll.isAnonymous && <span>• Anonymous</span>}
                  {poll.endsAt && (
                    <span>• Closes {format(poll.endsAt, "PPP")}</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No poll added</p>
            )}
          </div>
        </div>

      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          Once submitted, your event will be visible to all tribe members.
          They can RSVP and see all the details you've provided.
        </p>
      </div>
    </div>
  )
}
