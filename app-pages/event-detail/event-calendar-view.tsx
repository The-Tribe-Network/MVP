"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"

interface EventCalendarViewProps {
  startDate: Date
  endDate?: Date | null
}

export function EventCalendarView({ startDate, endDate }: EventCalendarViewProps) {
  const [date, setDate] = useState<Date | undefined>(startDate)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Event Date</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          defaultMonth={startDate}
          className="rounded-md border"
          modifiers={{
            event: [startDate, ...(endDate ? [endDate] : [])]
          }}
          modifiersStyles={{
            event: {
              fontWeight: 'bold',
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              borderRadius: '0.375rem'
            }
          }}
          disabled={(date) => {
            // Only allow selecting the event date(s)
            const dateStr = date.toDateString()
            const startStr = startDate.toDateString()
            const endStr = endDate?.toDateString()
            return dateStr !== startStr && dateStr !== endStr
          }}
        />
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Starts:</span>
            <span className="font-medium">
              {startDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
          {endDate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Ends:</span>
              <span className="font-medium">
                {endDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Time:</span>
            <span className="font-medium">
              {startDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
