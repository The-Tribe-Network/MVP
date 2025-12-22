import { Vote } from 'lucide-react'

interface EventPollsEmptyProps {
  onCreatePoll: () => void
}

export function EventPollsEmpty({ onCreatePoll }: EventPollsEmptyProps) {
  return (
    <div className="text-center py-8">
      <Vote className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
      <p className="text-sm text-muted-foreground mb-1">No polls yet</p>
      <p className="text-xs text-muted-foreground">Create a poll to get everyone's opinion!</p>
    </div>
  )
}
