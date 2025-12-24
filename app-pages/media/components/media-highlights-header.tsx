'use client'

import Link from 'next/link'
import { ArrowRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import UploadMediaBtn from './upload-media-btn'

interface MediaHighlightsHeaderProps {
  tribeId: string
}

export function MediaHighlightsHeader({ tribeId }: MediaHighlightsHeaderProps) {
  return (
    <div className="mb-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/tribe/${tribeId}`}>Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Media</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Highlights</h1>
          <p className="mt-1 text-muted-foreground">
            Discover the most popular albums and photos
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/tribe/${tribeId}/media/browse`}
            className="flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            Browse all
            <ArrowRight className="h-4 w-4" />
          </Link>
          <UploadMediaBtn tribeId={tribeId} />
          <Link href={`/tribe/${tribeId}/media/album/new`}>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Album
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
