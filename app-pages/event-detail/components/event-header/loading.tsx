import { Skeleton } from '@/components/ui/skeleton'

export function EventHeaderSkeleton() {
  return (
    <div className="flex items-center justify-end gap-2">
      <Skeleton className="h-9 w-28" />
      <Skeleton className="h-9 w-24" />
      <Skeleton className="h-9 w-9" />
    </div>
  )
}
