import { Skeleton } from "@/components/ui/skeleton"

export function AlbumHeaderSkeleton() {
  return (
    <div className="mb-8">
      {/* Back link skeleton */}
      <Skeleton className="h-5 w-32 mb-4" />

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="flex-1">
          {/* Title skeleton */}
          <Skeleton className="h-9 w-64 mb-2" />
          {/* Description skeleton */}
          <Skeleton className="h-5 w-full max-w-2xl mb-4" />

          {/* Meta info skeleton */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        {/* Action buttons skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}

