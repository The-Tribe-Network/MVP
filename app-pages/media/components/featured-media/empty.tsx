import { FolderOpen } from "lucide-react"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

interface FeaturedMediaEmptyProps {
  tribeId: string
}

export function FeaturedMediaEmpty({ tribeId }: FeaturedMediaEmptyProps) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">All Albums</h2>

      <Empty className="border min-h-[300px]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderOpen className="size-5" />
          </EmptyMedia>
          <EmptyTitle>No albums yet</EmptyTitle>
          <EmptyDescription>
            Create your first album to start organizing your tribe&apos;s photos and memories.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent>
          <Button variant="outline" asChild className="hover:bg-accent hover:text-accent-foreground">
            <Link href={`/tribe/${tribeId}/media/album/new`}>
              <Plus className="size-4 mr-2" />
              Create an album
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </section>
  )
}

