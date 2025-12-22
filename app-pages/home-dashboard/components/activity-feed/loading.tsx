import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

function ActivityItemSkeleton() {
  return (
    <div className="flex gap-4 p-6">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  )
}

export function ActivityFeedSkeleton() {
  return (
    <Card className="border-border/50 bg-card/50 lg:col-span-2">
      <div className="border-b border-border/50 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      <div className="divide-y divide-border/50">
        {Array.from({ length: 5 }).map((_, i) => (
          <ActivityItemSkeleton key={i} />
        ))}
      </div>
    </Card>
  )
}

