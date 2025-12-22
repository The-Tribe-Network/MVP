import { ImageIcon } from "lucide-react"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"

export function AllMediaEmpty() {
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold mb-4">All Media</h2>
      
      <Empty className="border min-h-[300px]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ImageIcon className="size-5" />
          </EmptyMedia>
          <EmptyTitle>No media uploaded</EmptyTitle>
          <EmptyDescription>
            Upload photos and videos to share moments with your tribe.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </section>
  )
}

