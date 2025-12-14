import { Globe, Lock, Shield } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import type { PrivacyType } from './types'

interface BasicInfoStepProps {
  name: string
  description: string
  privacy: PrivacyType
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onPrivacyChange: (value: PrivacyType) => void
}

export function BasicInfoStep({
  name,
  description,
  privacy,
  onNameChange,
  onDescriptionChange,
  onPrivacyChange,
}: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      {/* Album Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Album Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Summer Vibes 2024"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
          maxLength={100}
        />
        <p className="text-sm text-muted-foreground">
          {name.length}/100 characters
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-sm text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Describe what this album is about..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={4}
          maxLength={500}
        />
        <p className="text-sm text-muted-foreground">
          {description.length}/500 characters
        </p>
      </div>

      {/* Privacy Settings */}
      <div className="space-y-4">
        <Label>Privacy Settings</Label>
        <RadioGroup value={privacy} onValueChange={onPrivacyChange}>
          <div className="space-y-3">
            {/* Public Option */}
            <Card
              className={`cursor-pointer transition-all ${
                privacy === 'public'
                  ? 'border-primary bg-primary/5'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
              onClick={() => onPrivacyChange('public')}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <RadioGroupItem value="public" id="public" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="h-5 w-5" />
                      <Label htmlFor="public" className="text-base font-semibold cursor-pointer">
                        Public
                      </Label>
                      <Badge variant="secondary" className="ml-auto">
                        Recommended
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      All tribe members can view and add photos to this album.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Private Option */}
            <Card
              className={`cursor-pointer transition-all ${
                privacy === 'private'
                  ? 'border-primary bg-primary/5'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
              onClick={() => onPrivacyChange('private')}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <RadioGroupItem value="private" id="private" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="h-5 w-5" />
                      <Label htmlFor="private" className="text-base font-semibold cursor-pointer">
                        Private
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Only you can view and manage this album.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Only Option */}
            <Card
              className={`cursor-pointer transition-all ${
                privacy === 'admin_only'
                  ? 'border-primary bg-primary/5'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
              onClick={() => onPrivacyChange('admin_only')}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <RadioGroupItem value="admin_only" id="admin_only" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-5 w-5" />
                      <Label htmlFor="admin_only" className="text-base font-semibold cursor-pointer">
                        Admin Only
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Only admins and moderators can view and manage this album.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}
