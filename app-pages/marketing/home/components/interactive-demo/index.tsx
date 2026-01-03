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
      {/* <div className="max-w-6xl mx-auto"> */}

      <DemoProvider>
        <DemoContent />
      </DemoProvider>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Click through different communities. Like posts. Explore events.
        This is what your tribe could look like.
      </p>
      {/* </div> */}
    </SectionContainer>
  )
}
