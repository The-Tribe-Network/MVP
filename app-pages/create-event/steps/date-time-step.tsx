"use client"

import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import type { Control } from "react-hook-form"
import type { CreateEventInput } from "@/lib/validations/event"

interface DateTimeStepProps {
  control: Control<CreateEventInput>
}

export function DateTimeStep({ control }: DateTimeStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Date & Time
        </CardTitle>
        <CardDescription>
          When will your event take place?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date & Time *</FormLabel>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Date Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          // Preserve existing time when changing date
                          const existingDate = field.value
                          if (existingDate) {
                            date.setHours(existingDate.getHours(), existingDate.getMinutes())
                          } else {
                            date.setHours(12, 0) // Default to noon
                          }
                        }
                        field.onChange(date)
                      }}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Time Picker */}
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="time"
                    className="pl-10 w-full sm:w-[140px]"
                    value={field.value ? format(field.value, "HH:mm") : ""}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(":")
                      const newDate = field.value ? new Date(field.value) : new Date()
                      newDate.setHours(parseInt(hours), parseInt(minutes))
                      field.onChange(newDate)
                    }}
                  />
                </div>
              </div>
              <FormDescription>
                When does your event start?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End Date & Time (Optional)</FormLabel>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Date Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick an end date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          // Preserve existing time when changing date
                          const existingDate = field.value
                          if (existingDate) {
                            date.setHours(existingDate.getHours(), existingDate.getMinutes())
                          } else {
                            date.setHours(18, 0) // Default to 6pm for end time
                          }
                        }
                        field.onChange(date)
                      }}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Time Picker */}
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="time"
                    className="pl-10 w-full sm:w-[140px]"
                    value={field.value ? format(field.value, "HH:mm") : ""}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(":")
                      const newDate = field.value ? new Date(field.value) : new Date()
                      newDate.setHours(parseInt(hours), parseInt(minutes))
                      field.onChange(newDate)
                    }}
                  />
                </div>
              </div>
              <FormDescription>
                Leave blank if it's a single point in time
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
