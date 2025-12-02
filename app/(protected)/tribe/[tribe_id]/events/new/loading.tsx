import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function NewEventLoading() {
  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Progress Steps Skeleton */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex-1">
              <div className="flex items-center">
                <Skeleton className="w-10 h-10 rounded-full" />
                {step < 4 && <Skeleton className="h-0.5 flex-1 mx-2" />}
              </div>
              <div className="mt-2">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-32 hidden sm:block" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-2 w-full" />
      </div>

      {/* Form Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons Skeleton */}
      <div className="flex justify-between mt-6">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}
