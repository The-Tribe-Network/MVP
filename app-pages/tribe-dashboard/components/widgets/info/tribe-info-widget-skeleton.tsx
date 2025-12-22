import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TribeInfoWidgetSkeleton() {
  return (
    <Card>
      <CardHeader className="text-center pb-3">

        {/* Avatar skeleton */}
        <div className="flex justify-center mb-4">
          <Skeleton className="h-24 w-24 rounded-full" />
        </div>

        {/* Title skeleton */}
        <Skeleton className="h-8 w-48 mx-auto mb-2" />

        {/* Member count button skeleton */}
        <div className="flex justify-center mb-2">
          <Skeleton className="h-5 w-32" />
        </div>

        {/* Location skeleton */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Description skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full max-w-sm mx-auto" />
          <Skeleton className="h-4 w-3/4 max-w-sm mx-auto" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Invite button skeleton */}
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  );
}

