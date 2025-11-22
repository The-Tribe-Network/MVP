"use client"

import { useState } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Copy, Mail, X } from "lucide-react";

export default function InviteDialogContent() {
  const [copied, setCopied] = useState(false)
  const [emails, setEmails] = useState<string[]>([])
  const [currentEmail, setCurrentEmail] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const inviteLink = "https://tribe.app/invite/the-crew-8392"

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentEmail && currentEmail.includes("@")) {
      setEmails([...emails, currentEmail])
      setCurrentEmail("")
    }
  }

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter((email) => email !== emailToRemove))
  }

  const handleSendInvites = () => {
    // Logic to send invites would go here
    setIsOpen(false)
    setEmails([])
    setCurrentEmail("")
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Invite to The Crew</DialogTitle>
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
              placeholder="name@example.com"
              value={currentEmail}
              onChange={(e) => setCurrentEmail(e.target.value)}
              className="h-9"
            />
            <Button type="submit" variant="secondary" size="sm" disabled={!currentEmail}>
              Add
            </Button>
          </form>

          {emails.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {emails.map((email) => (
                <div
                  key={email}
                  className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1 flex items-center gap-1"
                >
                  {email}
                  <button onClick={() => removeEmail(email)} className="hover:text-primary/80 focus:outline-none">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DialogFooter className="sm:justify-between gap-2">
        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSendInvites} disabled={emails.length === 0}>
          <Mail className="h-4 w-4 mr-2" />
          Send Invitations
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}