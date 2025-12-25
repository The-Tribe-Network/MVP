'use client'

import { useState } from 'react'
import { useFieldArray, type Control } from 'react-hook-form'
import { UserPlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CreateTribeFormInput } from '@/lib/validations/tribe'

interface InviteMembersStepProps {
  control: Control<CreateTribeFormInput>
}

export function InviteMembersStep({ control }: InviteMembersStepProps) {
  const [currentEmail, setCurrentEmail] = useState('')

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'invitations',
  })

  const handleAddEmail = () => {
    if (currentEmail && currentEmail.includes('@')) {
      // Check for duplicates
      if (!fields.some((f) => f.email === currentEmail)) {
        append({ email: currentEmail, role: 'member' })
      }
      setCurrentEmail('')
    }
  }

  const handleRemoveEmail = (index: number) => {
    remove(index)
  }

  const handleUpdateRole = (index: number, newRole: 'admin' | 'moderator' | 'member') => {
    update(index, { ...fields[index], role: newRole })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center py-8">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <UserPlus className="h-12 w-12 text-primary" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="invite-email">Invite by Email</Label>
        <div className="flex gap-2">
          <Input
            id="invite-email"
            type="email"
            placeholder="friend@example.com"
            value={currentEmail}
            onChange={(e) => setCurrentEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddEmail()
              }
            }}
            className="bg-white/5 border-zinc-700"
          />
          <Button type="button" onClick={handleAddEmail}>
            Add
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Press Enter or click Add to include multiple emails
        </p>
      </div>

      {fields.length > 0 && (
        <div className="space-y-2">
          <Label>Invited Members ({fields.length})</Label>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center justify-between gap-3 p-3 bg-zinc-800/50 rounded-lg"
              >
                <span className="text-sm flex-1">{field.email}</span>
                <Select
                  value={field.role}
                  onValueChange={(value: 'admin' | 'moderator' | 'member') =>
                    handleUpdateRole(index, value)
                  }
                >
                  <SelectTrigger className="w-[140px] h-8 bg-zinc-700/50 border-zinc-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveEmail(index)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {fields.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            No members invited yet. You can always invite members later!
          </p>
        </div>
      )}
    </div>
  )
}
