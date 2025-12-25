'use client'

import { Calendar } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatEventDate, formatEventTimeRange } from '../../lib/utils'

interface EventDateDisplayProps {
  startDate: Date | string
  endDate?: Date | string | null
  isLoading?: boolean
}

export function EventDateDisplay({ startDate, endDate, isLoading }: EventDateDisplayProps) {
  if (isLoading) {
    return <EventDateDisplaySkeleton />
  }

  const formattedDate = formatEventDate(startDate)
  const formattedTime = formatEventTimeRange(startDate, endDate)

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Calendar className="h-4 w-4" />
      <span className="text-sm">
        {formattedDate} <span className="mx-1">|</span> {formattedTime}
      </span>
    </div>
  )
}

function EventDateDisplaySkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-4 w-64" />
    </div>
  )
}
