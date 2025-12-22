import { FolderOpen } from "lucide-react"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"

export function FeaturedMediaEmpty() {
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
      </Empty>
    </section>
  )
}

