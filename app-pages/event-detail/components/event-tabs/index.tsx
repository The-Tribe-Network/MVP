'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type TabId = 'discussion' | 'attachments' | 'timeline'

interface Tab {
  id: TabId
  label: string
  comingSoon?: boolean
}

const tabs: Tab[] = [
  { id: 'discussion', label: 'Discussion' },
  { id: 'attachments', label: 'Attachments', comingSoon: true },
  { id: 'timeline', label: 'Timeline', comingSoon: true },
]

interface EventTabsProps {
  children: React.ReactNode
  defaultTab?: TabId
}

export function EventTabs({ children, defaultTab = 'discussion' }: EventTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab)

  const handleTabClick = (tab: Tab) => {
    if (tab.comingSoon) {
      toast.info('Coming Soon', {
        description: `${tab.label} feature is coming soon!`,
      })
      return
    }
    setActiveTab(tab.id)
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-6" aria-label="Event tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={cn(
                'pb-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab.id && !tab.comingSoon
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
              )}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {activeTab === 'discussion' && children}
      </div>
    </div>
  )
}
