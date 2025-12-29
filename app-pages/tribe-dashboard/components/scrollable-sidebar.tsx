'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface ScrollableSidebarProps {
  children: ReactNode
  className?: string
}

/**
 * Reddit-style scrollable sidebar
 * - Sticks to top when scrolling down
 * - Becomes independently scrollable when content overflows viewport
 * - Main content always scrollable regardless of mouse position
 */
export function ScrollableSidebar({ children, className }: ScrollableSidebarProps) {
  return (
    <aside
      className={cn(
        'hidden lg:block',
        'sticky top-[72px]',
        'max-h-[calc(100vh-88px)]', // Viewport minus header height with some padding
        'overflow-y-auto',
        'scrollbar-thin',
        'dark:bg-card bg-accent rounded-md py-4',
        className
      )}
    >
      <div className="space-y-6 pb-6">
        {children}
      </div>
    </aside>
  )
}
