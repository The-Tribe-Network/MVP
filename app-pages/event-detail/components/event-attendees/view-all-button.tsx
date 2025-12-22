import { Button } from '@/components/ui/button'

interface ViewAllButtonProps {
  attendeeCount: number
}

export function ViewAllButton({ attendeeCount }: ViewAllButtonProps) {
  return (
    <Button variant="outline" className="w-full mt-4" size="sm">
      View All Attendees ({attendeeCount})
    </Button>
  )
}
