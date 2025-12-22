import { FileQuestion } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"

export function PostDetailEmpty() {
  return (
    <Card>
      <CardContent className="pt-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileQuestion className="size-5" />
            </EmptyMedia>
            <EmptyTitle>Post not found</EmptyTitle>
            <EmptyDescription>
              This post may have been deleted or you don't have permission to view it.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
  )
}
