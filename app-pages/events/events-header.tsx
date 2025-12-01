'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { CreateEventDialog } from './create-event-dialog'

interface EventsHeaderProps {
  tribeId: string;
}
export function EventsHeader({ tribeId }: EventsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href={`/tribe/${tribeId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Tribe Events</h1>
          <p className="text-muted-foreground">Plan and manage your tribe's events</p>
        </div>
      </div>

      <CreateEventDialog />
    </div>
  )
}

