'use client'

import { CheckCircle2, HelpCircle, Users } from 'lucide-react'
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { useEventAttendees } from '@/lib/hooks/use-events'

interface EventRsvpStatsProps {
  tribeId: string
  eventId: string
  capacity?: number | null
}

const chartConfig = {
  rsvps: {
    label: 'RSVPs',
  },
  going: {
    label: 'Going',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function EventRsvpStats({ tribeId, eventId, capacity }: EventRsvpStatsProps) {
  const { data: attendees = [], isLoading } = useEventAttendees(tribeId, eventId)

  if (isLoading) {
    return <EventRsvpStatsSkeleton />
  }

  const goingCount = attendees.filter((a) => a.status === 'going').length
  const maybeCount = attendees.filter((a) => a.status === 'maybe').length
  const totalResponded = goingCount + maybeCount

  // Calculate available spots
  const availableSpots = capacity ? Math.max(0, capacity - totalResponded) : 0

  // For the radial chart, calculate the end angle based on fill percentage
  // Start at 90 (top), go clockwise. 270 degrees is the max arc
  const maxAngle = 270
  const effectiveMax = capacity ?? Math.max(totalResponded, 1)
  const fillPercentage = Math.min(totalResponded / effectiveMax, 1)
  // Start from top (90°), go clockwise (negative direction in recharts)
  const endAngle = 90 - (fillPercentage * maxAngle)

  // Chart data - must have fill referencing a color key from config
  const chartData = [
    {
      name: 'going',
      rsvps: totalResponded,
      fill: 'var(--color-going)',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">RSVP</h3>
      </div>

      {/* Radial Chart */}
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[200px]"
      >
        <RadialBarChart
          data={chartData}
          startAngle={90}
          endAngle={endAngle}
          innerRadius={60}
          outerRadius={90}
        >
          <PolarGrid
            gridType="circle"
            radialLines={false}
            stroke="none"
            className="first:fill-muted last:fill-background"
            polarRadius={[66, 54]}
          />
          <RadialBar dataKey="rsvps" background cornerRadius={10} />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {totalResponded}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 20}
                        className="fill-muted-foreground text-sm"
                      >
                        {capacity ? `of ${capacity}` : 'RSVPs'}
                      </tspan>
                    </text>
                  )
                }
              }}
            />
          </PolarRadiusAxis>
        </RadialBarChart>
      </ChartContainer>

      {/* Stats Legend */}
      <div className="flex flex-row justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-[hsl(var(--chart-1))]/10">
            <CheckCircle2 className="h-3 w-3 text-[hsl(var(--chart-1))]" />
          </div>
          <p className="text-sm font-medium">{goingCount} Going</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-[hsl(var(--chart-2))]/10">
            <HelpCircle className="h-3 w-3 text-[hsl(var(--chart-2))]" />
          </div>
          <p className="text-sm font-medium">{maybeCount} Maybe</p>
        </div>
      </div>

      {/* Capacity Info */}
      {capacity && (
        <div className="text-center pt-2 border-t">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{availableSpots}</span>
            {' '}spot{availableSpots !== 1 ? 's' : ''} remaining
          </p>
        </div>
      )}
    </div>
  )
}

function EventRsvpStatsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-5 w-12" />
      </div>

      {/* Chart Skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-[200px] w-[200px] rounded-full" />
      </div>

      {/* Legend Skeleton */}
      <div className="flex flex-row justify-center gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  )
}
