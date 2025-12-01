'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export function InvitesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Friends</CardTitle>
        <CardDescription>
          Invite friends to join Tribe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="inviteEmail">Email Address</Label>
          <div className="flex gap-2">
            <Input
              id="inviteEmail"
              type="email"
              placeholder="friend@example.com"
              className="flex-1"
            />
            <Button>Send Invite</Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Your Invite Link</Label>
          <div className="flex gap-2">
            <Input
              readOnly
              value="https://tribe.app/invite/johndoe123"
              className="flex-1"
            />
            <Button variant="outline">Copy</Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this link with friends to invite them to Tribe
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Pending Invites</h3>

          <div className="space-y-2">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">sarah.wilson@email.com</p>
                  <p className="text-sm text-muted-foreground">
                    Sent 2 days ago
                  </p>
                </div>
                <Button variant="ghost" size="sm">Resend</Button>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">mike.chen@email.com</p>
                  <p className="text-sm text-muted-foreground">
                    Sent 5 days ago
                  </p>
                </div>
                <Button variant="ghost" size="sm">Resend</Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

