import { ImageIcon } from "lucide-react"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"

export function PhotoGridEmpty() {
  return (
    <Empty className="border min-h-[300px]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ImageIcon className="size-5" />
        </EmptyMedia>
        <EmptyTitle>No photos in this album</EmptyTitle>
        <EmptyDescription>
          This album doesn&apos;t have any photos yet. Upload some photos to get started.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

