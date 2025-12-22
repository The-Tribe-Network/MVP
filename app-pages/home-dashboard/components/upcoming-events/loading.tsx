import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

function EventItemSkeleton() {
  return (
    <div className="flex gap-3 p-4">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

export function UpcomingEventsSkeleton() {
  return (
    <Card className="border-border/50 bg-card/50">
      <div className="border-b border-border/50 p-4">
        <Skeleton className="h-5 w-32" />
      </div>

      <div className="divide-y divide-border/50">
        {Array.from({ length: 3 }).map((_, i) => (
          <EventItemSkeleton key={i} />
        ))}
      </div>
    </Card>
  )
}

