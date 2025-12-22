import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function EventsCalendarSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-40 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full rounded-md" />
      </CardContent>
    </Card>
  )
}
