'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

interface PostCardSkeletonProps {
  showImage?: boolean
}

function PostCardSkeleton({ showImage = false }: PostCardSkeletonProps) {
  return (
    <>
      <Card className="bg-transparent border-y-0 border-x-0 rounded-none">
        <CardContent className="pt-0 px-3">
          <div className="space-y-4">
            {/* Post Header */}
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>

            {/* Optional Image Skeleton */}
            {showImage && (
              <Skeleton className="h-64 w-full rounded-lg" />
            )}

            {/* Post Actions */}
            <div className="flex items-center gap-1 pt-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-8 ml-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Separator />
    </>
  )
}

export default PostCardSkeleton

