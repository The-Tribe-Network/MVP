'use client'

import { cn } from '@/lib/utils'
import { useDemoContext } from '../../demo-context'
import { DemoInfoWidget } from './info-widget'
import { DemoEventsWidget } from './events-widget'
import { DemoMediaWidget } from './media-widget'

interface DemoRightSidebarProps {
  className?: string
}

/**
 * Matches the actual ScrollableSidebar behavior:
 * - Sticks to top when scrolling down
 * - Independently scrollable when content overflows
 *
 * The outer div is the grid cell, inner div is the sticky element
 */
export function DemoRightSidebar({ className }: DemoRightSidebarProps) {
  const { activeTribe } = useDemoContext()

  return (
    <div className={cn('hidden lg:block', className)}>
      <aside
        className={cn(
          'sticky top-4',
          'max-h-[580px]', // Fits within demo container visible area
          'overflow-y-auto',
          'scrollbar-thin',
          'bg-accent dark:bg-card rounded-md py-4'
        )}
      >
        <div className="space-y-4 pb-4">
          <DemoInfoWidget tribe={activeTribe} />
          <DemoEventsWidget events={activeTribe.events} />
          <DemoMediaWidget media={activeTribe.media} />
        </div>
      </aside>
    </div>
  )
}
