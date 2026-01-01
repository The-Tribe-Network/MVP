'use client'

import { cn } from '@/lib/utils'
import {
  FileText,
  Users,
  UserCog,
  BarChart3,
  Bell,
  Image,
  Shield,
  AlertTriangle,
} from 'lucide-react'
import type { EventSettingsTab } from '../index'

interface EventSettingsNavigationProps {
  activeTab: EventSettingsTab
  onTabChange: (tab: EventSettingsTab) => void
}

interface NavItem {
  id: EventSettingsTab
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    id: 'details',
    label: 'Details',
    description: 'Edit event info',
    icon: FileText,
  },
  {
    id: 'attendees',
    label: 'Manage Attendees',
    description: 'View and remove attendees',
    icon: UserCog,
  },
  {
    id: 'rsvp',
    label: 'RSVP Settings',
    description: 'Capacity and deadlines',
    icon: Users,
  },
  {
    id: 'polls',
    label: 'Polls',
    description: 'Configure event polls',
    icon: BarChart3,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Reminders and alerts',
    icon: Bell,
  },
  {
    id: 'media',
    label: 'Media & Links',
    description: 'Attachments and albums',
    icon: Image,
  },
  {
    id: 'permissions',
    label: 'Permissions',
    description: 'Who can edit this event',
    icon: Shield,
  },
  {
    id: 'danger-zone',
    label: 'Danger Zone',
    description: 'Cancel or delete event',
    icon: AlertTriangle,
  },
]

export function EventSettingsNavigation({
  activeTab,
  onTabChange,
}: EventSettingsNavigationProps) {
  return (
    <nav className="w-64 shrink-0">
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          const isDanger = item.id === 'danger-zone'

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-colors',
                isActive
                  ? isDanger
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-primary/10 text-primary'
                  : isDanger
                    ? 'text-muted-foreground hover:bg-destructive/5 hover:text-destructive'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', isDanger && 'text-destructive')} />
              <div className="min-w-0">
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="block text-xs text-muted-foreground truncate">
                  {item.description}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
