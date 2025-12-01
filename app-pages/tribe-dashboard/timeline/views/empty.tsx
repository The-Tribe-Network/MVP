import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ArrowUpRightIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyViewProps {
  title: string
  description: string
  children: React.ReactNode
}
export default function EmptyView({ title, description, children }: EmptyViewProps) {
  return (
    <div className="h-full flex items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileText />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>
            {description}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            {children}
          </div>
        </EmptyContent>
      </Empty>
    </div>
  )
}