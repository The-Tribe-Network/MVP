import { Skeleton } from '@/components/ui/skeleton'

export function EventLocationSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="w-full aspect-video rounded-lg" />
      <div className="flex items-start gap-2">
        <Skeleton className="h-4 w-4 rounded shrink-0" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-9" />
      </div>
    </div>
  )
}
