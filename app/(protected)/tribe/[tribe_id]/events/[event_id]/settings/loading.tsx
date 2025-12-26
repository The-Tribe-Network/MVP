import { Skeleton } from '@/components/ui/skeleton'

export default function EventSettingsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Breadcrumb skeleton */}
        <Skeleton className="h-5 w-64 mb-6" />

        <div className="flex gap-8">
          {/* Sidebar skeleton */}
          <div className="w-64 space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>

          {/* Content skeleton */}
          <div className="flex-1 space-y-6">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
