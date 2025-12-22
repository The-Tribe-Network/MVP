import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function PastEventsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2 pb-4 border-b last:border-0">
            <div className="flex items-start justify-between">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-12" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
