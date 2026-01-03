'use client'

import { cn, getInitials } from '@/lib/utils'
import { useDemoContext } from '../demo-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function DemoMobileTribeSwitcher() {
  const { tribes, activeTribeId, setActiveTribe } = useDemoContext()

  return (
    <div className="md:hidden flex items-center gap-2 px-3 py-2 overflow-x-auto scrollbar-none bg-muted/30 border-b">
      {tribes.map((tribe) => {
        const isActive = tribe.id === activeTribeId
        const initials = getInitials(tribe.name)

        return (
          <button
            key={tribe.id}
            onClick={() => setActiveTribe(tribe.id)}
            className={cn(
              'flex-shrink-0 flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all',
              isActive
                ? 'bg-primary/10 ring-1 ring-primary/50'
                : 'hover:bg-muted'
            )}
          >
            <Avatar className="size-6 rounded-md">
              <AvatarImage
                src={tribe.avatar}
                alt={tribe.name}
                className="object-cover"
              />
              <AvatarFallback
                className={cn(
                  'rounded-md text-[10px] font-medium',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className={cn(
              'text-xs font-medium whitespace-nowrap',
              isActive ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {tribe.name.split(' ')[0]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
