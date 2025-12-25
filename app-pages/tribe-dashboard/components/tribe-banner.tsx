'use client'

import { cn } from '@/lib/utils'

interface TribeBannerProps {
  bannerUrl: string | null
  tribeName: string
  className?: string
}

export function TribeBanner({ bannerUrl, tribeName, className }: TribeBannerProps) {
  if (!bannerUrl) {
    // Fallback gradient when no banner is set
    return (
      <div
        className={cn(
          "w-full aspect-[3/1] lg:aspect-[4/1] rounded-lg",
          "bg-gradient-to-br from-primary/20 via-primary/10 to-background",
          "border border-border",
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        "w-full aspect-[3/1] lg:aspect-[4/1] rounded-lg overflow-hidden",
        "border border-border",
        className
      )}
    >
      <img
        src={bannerUrl}
        alt={`${tribeName} banner`}
        className="w-full h-full object-cover"
      />
    </div>
  )
}
