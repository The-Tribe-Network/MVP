'use client'

import { useDemoContext } from '../demo-context'
import { DemoHeader } from './demo-header'
import { DemoTimeline } from './demo-timeline'
import { DemoRightSidebar } from './demo-right-sidebar'
import { DemoMobileTribeSwitcher } from './demo-mobile-tribe-switcher'

export function DemoDashboard() {
  const { activeTribe } = useDemoContext()

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-background">
      {/* Mobile tribe switcher */}
      <DemoMobileTribeSwitcher />

      {/* Header with banner and avatar - scrolls with page */}
      <DemoHeader tribe={activeTribe} />

      {/* Main content area - matches actual dashboard layout */}
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left/Main Column - Timeline */}
          <main className="lg:col-span-8">
            <DemoTimeline />
          </main>

          {/* Right Column - Sticky Sidebar */}
          <DemoRightSidebar className="lg:col-span-4" />
        </div>
      </div>
    </div>
  )
}
