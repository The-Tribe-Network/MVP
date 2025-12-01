'use client'

import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface UsernameFieldProps {
  value: string
  onChange: (value: string) => void
  error: string | null
  isChecking: boolean
  disabled?: boolean
}

export function UsernameField({
  value,
  onChange,
  error,
  isChecking,
  disabled = false,
}: UsernameFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="username">Username</Label>
      <div className="relative">
        <Input
          id="username"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="johndoe"
          disabled={disabled || isChecking}
        />
        {isChecking && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Your unique username (3-30 characters, letters, numbers, and underscores)
      </p>
    </div>
  )
}

