'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface MediaGridSkeletonProps {
  height?: string
  count?: number
}

export function MediaGridSkeleton({
  height = 'h-[500px]',
  count = 8,
}: MediaGridSkeletonProps) {
  return (
    <div className="border rounded-lg">
      <ScrollArea className={cn(height, 'p-4')}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: count }).map((_, index) => (
            <Skeleton key={index} className="aspect-square rounded-lg" />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

