'use client'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Settings, UserPlus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { tribeDetailOptions } from '@/lib/query-options'
import { useDialogStore } from '@/lib/stores/dialog-store'
import { TribeHeaderNav } from '@/components/tribe-header-nav'
import Link from 'next/link'
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface TribeHeaderProps {
  tribeId: string
  className?: string
}

export function TribeHeader({ tribeId, className }: TribeHeaderProps) {
  const { data: tribe, isLoading } = useQuery(tribeDetailOptions(tribeId))
  const openDialog = useDialogStore((s) => s.openDialog)

  if (isLoading) {
    return <TribeHeaderSkeleton className={className} />
  }

  if (!tribe) {
    return null
  }

  const avatarFallback = tribe.name.substring(0, 2).toUpperCase()

  return (
    <div className={cn("relative", className)}>
      {/* Banner */}
      <div className="w-full aspect-[4/1] lg:aspect-[5/1] overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background rounded-sm">
        {tribe.banner && (
          <img
            src={tribe.banner}
            alt={`${tribe.name} banner`}
            className="w-full h-full object-cover rounded-sm"
          />
        )}
      </div>

      {/* Overlay bar with avatar + name + actions */}
      <div className="relative bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 py-3">
            {/* Avatar - positioned to overlap banner */}
            <div className="-mt-12 lg:-mt-14">
              <button
                onClick={() => {
                  if (tribe.avatar && tribe.avatar !== "/placeholder.svg") {
                    openDialog("image-preview", {
                      imageUrl: tribe.avatar,
                      altText: `${tribe.name} avatar`,
                    });
                  }
                }}
                className="cursor-pointer hover:opacity-90 transition-opacity disabled:cursor-default disabled:opacity-100"
                disabled={!tribe.avatar || tribe.avatar === "/placeholder.svg"}
                aria-label="View tribe avatar"
              >
                <Avatar className="h-20 w-20 lg:h-24 lg:w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={tribe.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xl lg:text-2xl bg-primary text-primary-foreground">
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
              </button>
            </div>

            {/* Tribe name */}
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <h1 className="text-xl lg:text-2xl font-bold truncate">
                {tribe.name}
              </h1>

              {/* Invite Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        openDialog("invite", { tribeId, tribeName: tribe.name })
                      }
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Invite</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Actions - desktop only */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Navigation Tabs */}
              <TribeHeaderNav tribeId={tribeId} tribeName={tribe.name} />

              {/* Settings Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/tribe/${tribeId}/settings`}>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TribeHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)}>
      {/* Banner skeleton */}
      <Skeleton className="w-full aspect-[4/1] lg:aspect-[5/1]" />

      {/* Overlay bar skeleton */}
      <div className="relative bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 py-3">
            {/* Avatar skeleton */}
            <div className="-mt-12 lg:-mt-14">
              <Skeleton className="h-20 w-20 lg:h-24 lg:w-24 rounded-full border-4 border-background" />
            </div>

            {/* Name skeleton */}
            <div className="flex-1">
              <Skeleton className="h-7 w-48" />
            </div>

            {/* Actions skeleton - desktop only */}
            <div className="hidden lg:flex items-center gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
