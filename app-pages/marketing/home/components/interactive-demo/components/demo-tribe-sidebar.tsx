'use client'

import { cn, getInitials } from '@/lib/utils'
import { useDemoContext } from '../demo-context'
import { FlameKindling } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'

export function DemoTribeSidebar() {
  const { tribes, activeTribeId, setActiveTribe } = useDemoContext()

  return (
    <div className="hidden md:flex w-[60px] flex-col border-r bg-muted/30 py-3 gap-2">
      {/* App logo */}
      <div className="flex justify-center mb-1">
        <div className="bg-primary text-primary-foreground h-8 w-8 rounded-lg flex items-center justify-center">
          <FlameKindling className="h-4 w-4" />
        </div>
      </div>

      <Separator className="mx-auto w-3/4" />

      {/* Tribe avatars */}
      <div className="flex flex-col gap-2 items-center pt-2">
        <TooltipProvider delayDuration={100}>
          {tribes.map((tribe) => {
            const isActive = tribe.id === activeTribeId
            const initials = getInitials(tribe.name)

            return (
              <Tooltip key={tribe.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveTribe(tribe.id)}
                    className={cn(
                      'relative rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      isActive && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    )}
                  >
                    <Avatar className="size-9 rounded-lg">
                      <AvatarImage
                        src={tribe.avatar}
                        alt={tribe.name}
                        className="object-cover"
                      />
                      <AvatarFallback
                        className={cn(
                          'rounded-lg text-xs font-medium',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {tribe.name}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </div>
    </div>
  )
}
