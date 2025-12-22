import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function PastEventsEmpty() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Past Events</CardTitle>
        <CardDescription>Previous tribe events</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground">
          No past events yet
        </p>
      </CardContent>
    </Card>
  )
}
