'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin } from 'lucide-react'
import { EventLocationSkeleton } from './loading'

interface EventLocationMapProps {
  location: string
  isLoading?: boolean
}

/**
 * Event Location Map Section
 *
 * Displays location information (placeholder for future map integration)
 *
 * TODO: Integrate real map component (Google Maps, Mapbox, etc.)
 */
export function EventLocationMap({ location, isLoading }: EventLocationMapProps) {
  // Loading state
  if (isLoading) return <EventLocationSkeleton />

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* TODO: Replace with actual map component */}
        <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium">{location}</p>
            <p className="text-xs text-muted-foreground mt-1">Map integration coming soon</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
