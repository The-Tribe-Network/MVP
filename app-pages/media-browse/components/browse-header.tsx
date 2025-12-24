'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import UploadMediaBtn from '@/app-pages/media/components/upload-media-btn'

interface BrowseHeaderProps {
  tribeId: string
}

export function BrowseHeader({ tribeId }: BrowseHeaderProps) {
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
            <BreadcrumbLink asChild>
              <Link href={`/tribe/${tribeId}/media`}>Media</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Browse</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Browse</h1>
          <p className="mt-1 text-muted-foreground">
            Explore all albums and photos in the gallery
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
