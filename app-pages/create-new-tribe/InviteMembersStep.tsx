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
import { InvitedMember } from './types'

interface InviteMembersStepProps {
  inviteEmails: InvitedMember[]
  currentEmail: string
  onEmailChange: (value: string) => void
  onAddEmail: () => void
  onRemoveEmail: (email: string) => void
  onUpdateRole: (email: string, role: 'admin' | 'moderator' | 'member') => void
}

export function InviteMembersStep({
  inviteEmails,
  currentEmail,
  onEmailChange,
  onAddEmail,
  onRemoveEmail,
  onUpdateRole,
}: InviteMembersStepProps) {
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
            onChange={(e) => onEmailChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                onAddEmail()
              }
            }}
            className="bg-white/5 border-zinc-700"
          />
          <Button onClick={onAddEmail} type="button">
            Add
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Press Enter or click Add to include multiple emails
        </p>
      </div>

      {inviteEmails.length > 0 && (
        <div className="space-y-2">
          <Label>Invited Members ({inviteEmails.length})</Label>
          <div className="space-y-2">
            {inviteEmails.map((member) => (
              <div
                key={member.email}
                className="flex items-center justify-between gap-3 p-3 bg-zinc-800/50 rounded-lg"
              >
                <span className="text-sm flex-1">{member.email}</span>
                <Select
                  value={member.role}
                  onValueChange={(value: 'admin' | 'moderator' | 'member') =>
                    onUpdateRole(member.email, value)
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
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveEmail(member.email)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {inviteEmails.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            No members invited yet. You can always invite members later!
          </p>
        </div>
      )}
    </div>
  )
}

