'use client'

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import { useDemoContext } from '../demo-context'

interface DemoContainerProps {
  children: ReactNode
  className?: string
}

export function DemoContainer({ children, className }: DemoContainerProps) {
  const { activeTribe } = useDemoContext()

  // Generate URL-friendly tribe name
  const urlSlug = activeTribe.name.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={cn('relative mx-auto', className)}>
      {/* Browser-like frame */}
      <div className="rounded-xl overflow-hidden border border-border/50 shadow-2xl bg-background">
        {/* Browser toolbar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/50">
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          {/* URL bar */}
          <div className="flex-1 mx-4">
            <div className="bg-background/80 rounded-md px-3 py-1.5 text-xs text-muted-foreground text-center border border-border/30 truncate">
              tribe.app/{urlSlug}
            </div>
          </div>
          {/* Placeholder for symmetry */}
          <div className="w-14" />
        </div>

        {/* Content area - horizontal layout for sidebar + main */}
        <div className="flex h-[1024px] md:h-[650px] overflow-hidden">
          {children}
        </div>
      </div>

      {/* Decorative glow effect */}
      <div className="absolute -inset-4 -z-10 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 blur-3xl opacity-50" />
    </div>
  )
}
