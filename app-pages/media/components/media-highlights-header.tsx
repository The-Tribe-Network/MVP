'use client'

import Link from 'next/link'
import { ArrowRight, ChevronDown, Plus, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDialogStore } from '@/lib/stores/dialog-store'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface MediaHighlightsHeaderProps {
  tribeId: string
}

export function MediaHighlightsHeader({ tribeId }: MediaHighlightsHeaderProps) {
  const openDialog = useDialogStore((s) => s.openDialog)
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleUploadMedia = () => {
    openDialog('media-upload', { tribeId })
  }

  return (
    <div className="mb-4">
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
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-l-2">
                <Plus className="h-4 w-4 mr-2" />
                Create
                <Separator orientation="vertical" className="h-4 w-4 ml-2" />
                <ChevronDown className={cn("h-4 w-4 ml-2 transition-transform duration-300", isOpen ? 'rotate-180' : '')} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleUploadMedia}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Media
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/tribe/${tribeId}/media/album/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Album
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild>
            <Link href={`/tribe/${tribeId}/media/browse`}>
              Browse all
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
