'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Smartphone } from 'lucide-react'

export function SecurityTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Password & Security</CardTitle>
        <CardDescription>
          Keep your account secure
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Change Password</h3>

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" />
          </div>

          <Button>Update Password</Button>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Two-Factor Authentication</h3>

          <div className="rounded-lg border p-4">
            <div className="flex items-start gap-4">
              <Smartphone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Authenticator App</p>
                    <p className="text-sm text-muted-foreground">
                      Use an authentication app for extra security
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Active Sessions</h3>

          <div className="space-y-2">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">MacBook Pro</p>
                    <p className="text-sm text-muted-foreground">
                      San Francisco, CA • Current session
                    </p>
                  </div>
                </div>
                <span className="text-xs text-green-500">Active</span>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">iPhone 14 Pro</p>
                    <p className="text-sm text-muted-foreground">
                      San Francisco, CA • Last active 2h ago
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Revoke</Button>
              </div>
            </div>
          </div>

          <Button variant="outline">Sign Out All Devices</Button>
        </div>
      </CardContent>
    </Card>
  )
}

