'use client'

import { useState, useEffect, useRef } from 'react'
import { AtSign, Check, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCheckUsername } from '@/lib/hooks/use-profile'

interface UsernameStepProps {
  username: string
  onUsernameChange: (value: string) => void
}

export function UsernameStep({ username, onUsernameChange }: UsernameStepProps) {
  const [debouncedUsername, setDebouncedUsername] = useState(username)
  const checkUsername = useCheckUsername()
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Debounce username input
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedUsername(username)
    }, 500)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [username])

  // Check username availability when debounced value changes
  useEffect(() => {
    if (debouncedUsername && debouncedUsername.length >= 3) {
      checkUsername.mutate(debouncedUsername)
    }
  }, [debouncedUsername])

  const isChecking = checkUsername.isPending
  const isAvailable = checkUsername.data?.available
  const showValidation = username.length >= 3 && !isChecking

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center py-8">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <AtSign className="h-12 w-12 text-primary" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username *</Label>
        <div className="relative">
          <Input
            id="username"
            placeholder="johndoe"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value.toLowerCase())}
            className="bg-white/5 border-zinc-700 pl-8"
            autoFocus
          />
          <AtSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          {isChecking && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {showValidation && isAvailable === true && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Check className="h-4 w-4 text-green-500" />
            </div>
          )}

          {showValidation && isAvailable === false && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-red-500" />
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Your unique username. Letters, numbers, and underscores only.
        </p>

        {showValidation && isAvailable === false && (
          <p className="text-xs text-red-500">
            This username is already taken
          </p>
        )}

        {showValidation && isAvailable === true && (
          <p className="text-xs text-green-500">
            This username is available!
          </p>
        )}
      </div>
    </div>
  )
}
