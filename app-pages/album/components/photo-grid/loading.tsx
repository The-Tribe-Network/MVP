import { Skeleton } from "@/components/ui/skeleton"

export function PhotoGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton 
          key={i} 
          className="aspect-square rounded-lg" 
        />
      ))}
    </div>
  )
}

