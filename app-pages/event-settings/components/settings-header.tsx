'use client'

import { Settings } from 'lucide-react'

interface EventSettingsHeaderProps {
  eventTitle: string
}

export function EventSettingsHeader({ eventTitle }: EventSettingsHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-lg bg-primary/10">
        <Settings className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Manage Event</h1>
        <p className="text-muted-foreground mt-1">
          Manage <span className="font-medium text-foreground">{eventTitle}</span>
        </p>
      </div>
    </div>
  )
}
