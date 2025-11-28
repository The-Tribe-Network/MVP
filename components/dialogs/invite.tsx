"use client"

import { useState } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Dialog } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Copy, Mail, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSendTribeInvitations } from "@/lib/hooks/use-tribes";
import { toast } from "sonner";

interface InvitedMember {
  email: string;
  role: "admin" | "moderator" | "member";
}

interface InviteDialogContentProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  tribeId: string;
  tribeName: string;
}

export default function InviteDialogContent({ isOpen, setIsOpen, tribeId, tribeName }: InviteDialogContentProps) {
  const [copied, setCopied] = useState(false)
  const [invitedMembers, setInvitedMembers] = useState<InvitedMember[]>([])
  const [currentEmail, setCurrentEmail] = useState("")
  const sendInvitations = useSendTribeInvitations(tribeId)

  // Note: Invite link feature can be enhanced later
  // For now, focusing on email-based invitations
  const inviteLink = "Invite link feature coming soon"

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (currentEmail && emailRegex.test(currentEmail)) {
      // Check if email is already in the list
      if (invitedMembers.some((member) => member.email === currentEmail)) {
        toast.error("This email is already in the list")
        return
      }
      setInvitedMembers([...invitedMembers, { email: currentEmail, role: "member" }])
      setCurrentEmail("")
    } else if (currentEmail) {
      toast.error("Please enter a valid email address")
    }
  }

  const removeEmail = (emailToRemove: string) => {
    setInvitedMembers(invitedMembers.filter((member) => member.email !== emailToRemove))
  }

  const updateRole = (email: string, role: "admin" | "moderator" | "member") => {
    setInvitedMembers(
      invitedMembers.map((member) =>
        member.email === email ? { ...member, role } : member
      )
    )
  }

  const handleSendInvites = async () => {
    if (invitedMembers.length === 0) {
      return
    }

    try {
      await sendInvitations.mutateAsync({
        invitations: invitedMembers,
      })
      toast.success(`Successfully sent ${invitedMembers.length} invitation(s)!`)
      setIsOpen(false)
      setInvitedMembers([])
      setCurrentEmail("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send invitations")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to {tribeName}</DialogTitle>
          <DialogDescription>
            Invite friends to join this tribe. They will receive an email invitation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="link" className="text-sm font-medium">
              Share Invite Link
            </Label>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <Input id="link" defaultValue={inviteLink} readOnly className="bg-muted/50 h-9" />
              </div>
              <Button type="submit" size="sm" className="px-3" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy</span>
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">Anyone with this link can join this tribe.</p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or invite by email</span>
            </div>
          </div>

          <div className="space-y-3">
            <form onSubmit={handleAddEmail} className="flex gap-2">
              <Input
                type="email"
                placeholder="name@example.com"
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                className="h-9"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddEmail(e)
                  }
                }}
              />
              <Button type="submit" variant="secondary" size="sm" disabled={!currentEmail}>
                Add
              </Button>
            </form>

            {invitedMembers.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Invited Members ({invitedMembers.length})
                </Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {invitedMembers.map((member) => (
                    <div
                      key={member.email}
                      className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded-lg"
                    >
                      <span className="text-sm flex-1 truncate">{member.email}</span>
                      <Select
                        value={member.role}
                        onValueChange={(value: "admin" | "moderator" | "member") =>
                          updateRole(member.email, value)
                        }
                      >
                        <SelectTrigger className="w-[120px] h-8 text-xs">
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
                        onClick={() => removeEmail(member.email)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSendInvites}
            disabled={invitedMembers.length === 0 || sendInvitations.isPending}
          >
            <Mail className="h-4 w-4 mr-2" />
            {sendInvitations.isPending ? "Sending..." : "Send Invitations"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  )
}