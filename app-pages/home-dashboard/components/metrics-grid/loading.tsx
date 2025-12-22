import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

function MetricCardSkeleton() {
  return (
    <Card className="border-border/50 bg-card/50 p-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </Card>
  )
}

export function MetricsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>
  )
}

