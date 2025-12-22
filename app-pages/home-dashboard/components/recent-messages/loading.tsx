import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

function MessageItemSkeleton() {
  return (
    <div className="flex gap-3 p-4">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  )
}

export function RecentMessagesSkeleton() {
  return (
    <Card className="border-border/50 bg-card/50">
      <div className="border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-6 rounded-full" />
        </div>
      </div>

      <div className="divide-y divide-border/50">
        {Array.from({ length: 4 }).map((_, i) => (
          <MessageItemSkeleton key={i} />
        ))}
      </div>
    </Card>
  )
}

