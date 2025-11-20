'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'

interface MediaHeaderProps {
  tribeId: string;
}
export function MediaHeader({ tribeId }: MediaHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <Link href={`/tribe/${tribeId}`}>
        <Button variant="ghost">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <Button className="bg-primary hover:bg-primary/90">
        <Plus className="h-4 w-4 mr-2" />
        Create Album
      </Button>
    </div>
  )
}

