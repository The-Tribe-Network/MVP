'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export function CreateEventDialog() {
  const params = useParams()
  const tribeId = params?.tribe_id as string

  return (
    <Link href={`/tribe/${tribeId}/events/new`}>
      <Button className="bg-primary">
        <Plus className="h-4 w-4 mr-2" />
        Create Event
      </Button>
    </Link>
  )
}

