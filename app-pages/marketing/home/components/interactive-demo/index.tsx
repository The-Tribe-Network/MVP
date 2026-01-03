'use client'

import { DemoProvider } from './demo-context'
import { DemoContainer } from './components/demo-container'
import { DemoTribeSidebar } from './components/demo-tribe-sidebar'
import { DemoDashboard } from './components/demo-dashboard'
import { SectionContainer } from '@/components/marketing/section-container'

function DemoContent() {
  return (
    <DemoContainer>
      <DemoTribeSidebar />
      <DemoDashboard />
    </DemoContainer>
  )
}

export function InteractiveDemo() {
  return (
    <SectionContainer className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-2xl md:text-4xl font-bold">See It In Action</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Click through different communities. Like posts. Explore events.
            This is what your tribe could look like.
          </p>
        </div>

        <DemoProvider>
          <DemoContent />
        </DemoProvider>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Interactive demo with sample data. Click the avatars on the left to explore different communities.
        </p>
      </div>
    </SectionContainer>
  )
}
