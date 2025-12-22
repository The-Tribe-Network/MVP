import { Skeleton } from "@/components/ui/skeleton"

export function AllMediaSkeleton() {
  return (
    <section className="mt-8">
      <Skeleton className="h-8 w-28 mb-4" />
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="aspect-square rounded-lg" 
          />
        ))}
      </div>
    </section>
  )
}

