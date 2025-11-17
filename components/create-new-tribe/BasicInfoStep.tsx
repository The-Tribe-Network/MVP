import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface BasicInfoStepProps {
  tribeName: string
  description: string
  avatar: string
  onTribeNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onAvatarChange: (value: string) => void
}

export function BasicInfoStep({
  tribeName,
  description,
  avatar,
  onTribeNameChange,
  onDescriptionChange,
  onAvatarChange,
}: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={avatar || '/placeholder.svg?height=96&width=96'} />
          <AvatarFallback className="text-2xl bg-zinc-700">
            {tribeName ? tribeName.substring(0, 2).toUpperCase() : 'TR'}
          </AvatarFallback>
        </Avatar>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Avatar
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tribe-name">Tribe Name *</Label>
        <Input
          id="tribe-name"
          placeholder="Enter your tribe name"
          value={tribeName}
          onChange={(e) => onTribeNameChange(e.target.value)}
          className="bg-white/5 border-zinc-700"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Tell us what your tribe is about..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="bg-white/5 border-zinc-700 min-h-[120px]"
        />
      </div>
    </div>
  )
}

