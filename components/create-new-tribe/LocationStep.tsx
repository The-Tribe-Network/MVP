import { MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LocationStepProps {
  location: string
  onLocationChange: (value: string) => void
}

export function LocationStep({ location, onLocationChange }: LocationStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center py-8">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <MapPin className="h-12 w-12 text-primary" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          placeholder="City, State or Country"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className="bg-white/5 border-zinc-700"
        />
        <p className="text-sm text-muted-foreground">
          This helps members find local events and meetups
        </p>
      </div>
    </div>
  )
}

