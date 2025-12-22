'use client'

import { Image as ImageIcon } from 'lucide-react'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'

interface MediaGridEmptyProps {
  title?: string
  description?: string
}

export function MediaGridEmpty({
  title = 'No media found',
  description = 'Upload some photos to get started.',
}: MediaGridEmptyProps) {
  return (
    <Empty className="border rounded-lg py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ImageIcon className="size-5" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

