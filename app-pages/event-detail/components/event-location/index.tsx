'use client'

import { Button } from '@/components/ui/button'
import { MapPin, ExternalLink, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { EventLocationSkeleton } from './loading'

interface EventLocationMapProps {
  location: string
  isLoading?: boolean
}

/**
 * Event Location Map Section
 *
 * Displays location information without card wrapper
 *
 * TODO: Integrate real map component (Google Maps, Mapbox, etc.)
 */
export function EventLocationMap({ location, isLoading }: EventLocationMapProps) {
  // Loading state
  if (isLoading) return <EventLocationSkeleton />

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(location)
    toast.success('Address copied to clipboard')
  }

  const handleOpenInMaps = () => {
    // Open in Google Maps
    const encodedLocation = encodeURIComponent(location)
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, '_blank')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Location</h3>
      </div>

      {/* Map Placeholder - In a real implementation, use Google Maps, Mapbox, or similar */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border border-border">
        {/* Static map placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Map View</p>
          </div>
        </div>

        {/* You can replace this with an actual map iframe or component */}
        {/* Example with Google Maps static image:
        <img
          src={`https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(location)}&zoom=14&size=400x300&markers=color:red%7C${encodeURIComponent(location)}&key=YOUR_API_KEY`}
          alt="Event location map"
          className="w-full h-full object-cover"
        />
        */}
      </div>

      {/* Address */}
      <div className="flex items-start gap-2">
        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
        <p className="text-sm text-muted-foreground">{location}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleOpenInMaps}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open in Maps
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyAddress}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
