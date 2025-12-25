'use client'

import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'

interface EventCoverImageProps {
  coverImageUrl: string | null | undefined
  title: string
  isLoading?: boolean
}

export function EventCoverImage({ coverImageUrl, title, isLoading }: EventCoverImageProps) {
  if (isLoading) {
    return <EventCoverImageSkeleton />
  }

  if (!coverImageUrl) {
    return null
  }

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
      <Image
        src={coverImageUrl}
        alt={`Cover image for ${title}`}
        fill
        className="object-cover"
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
      />
    </div>
  )
}

function EventCoverImageSkeleton() {
  return (
    <Skeleton className="w-full aspect-video rounded-lg" />
  )
}
