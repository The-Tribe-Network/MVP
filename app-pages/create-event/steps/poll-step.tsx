"use client"

import { Vote, Calendar as CalendarIcon } from "lucide-react"
import { Control, useFieldArray, useWatch } from "react-hook-form"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { type CreateEventWithPollInput } from "@/lib/validations/event"

interface PollStepProps {
  control: Control<CreateEventWithPollInput>
}

export function PollStep({ control }: PollStepProps) {
  // Watch poll value to determine if poll is included (reactive)
  const pollValue = useWatch({ control, name: "poll" })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Vote className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Add a Poll</h3>
          <Badge variant="outline" className="ml-2 font-normal">Optional</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Create a poll to let attendees vote on event details
        </p>
      </div>
        {/* Toggle to include poll */}
        <FormField
          control={control}
          name="poll"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div className="space-y-0.5">
                  <FormLabel className="text-base font-medium cursor-pointer">
                    Include a poll with this event
                  </FormLabel>
                  <FormDescription>
                    Ask attendees to vote on something like food preferences or timing
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value !== null && field.value !== undefined}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        field.onChange({
                          question: "",
                          options: ["", ""],
                          allowMultiple: false,
                          isAnonymous: false,
                        })
                      } else {
                        field.onChange(null)
                      }
                    }}
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />

        {pollValue !== null && pollValue !== undefined && (
          <>
            <Separator />

            {/* Poll Question */}
            <FormField
              control={control}
              name="poll.question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poll Question *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What should we have for food?"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ask a clear question that attendees can vote on
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Poll Options */}
            <PollOptionsList control={control} />

            {/* Poll Expiration Date */}
            <FormField
              control={control}
              name="poll.endsAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Poll Closes On (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date (optional)</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Optional: When should this poll close?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Poll Settings */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Poll Settings</Label>

              <FormField
                control={control}
                name="poll.allowMultiple"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        Allow multiple choices
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Let voters select more than one option
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="poll.isAnonymous"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        Anonymous voting
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Hide who voted for each option
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </>
        )}
    </div>
  )
}

// Poll Options List Component
function PollOptionsList({ control }: { control: Control<CreateEventWithPollInput> }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "poll.options" as never,
  })

  return (
    <FormItem>
      <FormLabel>Poll Options *</FormLabel>
      <FormDescription>Add 2-10 options for attendees to choose from</FormDescription>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <FormField
            key={field.id}
            control={control}
            name={`poll.options.${index}`}
            render={({ field }) => (
              <FormItem>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      placeholder={`Option ${index + 1}`}
                      {...field}
                    />
                  </FormControl>
                  {fields.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
      {fields.length < 10 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append("")}
          className="mt-2"
        >
          Add Option
        </Button>
      )}
    </FormItem>
  )
}
