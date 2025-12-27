'use client'

import { ImagePlus } from 'lucide-react'

export function CreateAlbumHeader() {
  return (
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-lg bg-primary/10">
        <ImagePlus className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Create Album</h1>
        <p className="text-muted-foreground mt-1">
          Organize and share your tribe's photos and memories
        </p>
      </div>
    </div>
  )
}
