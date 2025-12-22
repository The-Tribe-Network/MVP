import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

function AlbumCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Cover image skeleton */}
      <Skeleton className="aspect-square w-full rounded-none" />
      
      {/* Content skeleton */}
      <CardContent className="pt-4">
        {/* Title */}
        <Skeleton className="h-5 w-3/4 mb-2" />
        
        {/* Meta info row */}
        <div className="flex justify-between">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

export function FeaturedMediaSkeleton() {
  return (
    <section>
      <Skeleton className="h-8 w-32 mb-6" />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <AlbumCardSkeleton key={i} />
        ))}
      </div>
    </section>
  )
}


