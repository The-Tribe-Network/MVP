import { Skeleton } from "@/components/ui/skeleton"

function CommentItemSkeleton() {
  return (
    <div className="flex gap-3 py-3 border-t first:border-t-0">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-6 w-12 mt-2" />
      </div>
    </div>
  )
}

export function CommentsSkeleton() {
  return (
    <div className="space-y-4 py-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <CommentItemSkeleton key={i} />
      ))}
    </div>
  )
}
