'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { PrivacySettings } from './types'

export function PrivacyTab() {
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'friends',
    showOnlineStatus: true,
    showLastSeen: false,
    allowFriendRequests: true,
    showEmail: false,
  })

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>
            Control who can see your information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="profileVisibility">Profile Visibility</Label>
            <Select
              value={privacy.profileVisibility}
              onValueChange={(value: 'public' | 'friends' | 'tribe' | 'private') =>
                setPrivacy({ ...privacy, profileVisibility: value })
              }
            >
              <SelectTrigger id="profileVisibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Everyone</SelectItem>
                <SelectItem value="friends">Friends Only</SelectItem>
                <SelectItem value="tribe">Tribe Members Only</SelectItem>
                <SelectItem value="private">Private - Only Me</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Activity Status</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Online Status</Label>
                <p className="text-xs text-muted-foreground">
                  Let others see when you're online
                </p>
              </div>
              <Switch
                checked={privacy.showOnlineStatus}
                onCheckedChange={(checked) =>
                  setPrivacy({ ...privacy, showOnlineStatus: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Last Seen</Label>
                <p className="text-xs text-muted-foreground">
                  Display when you were last active
                </p>
              </div>
              <Switch
                checked={privacy.showLastSeen}
                onCheckedChange={(checked) =>
                  setPrivacy({ ...privacy, showLastSeen: checked })
                }
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Contact & Discovery</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Friend Requests</Label>
                <p className="text-xs text-muted-foreground">
                  Let people send you friend requests
                </p>
              </div>
              <Switch
                checked={privacy.allowFriendRequests}
                onCheckedChange={(checked) =>
                  setPrivacy({ ...privacy, allowFriendRequests: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Email Address</Label>
                <p className="text-xs text-muted-foreground">
                  Display your email on your profile
                </p>
              </div>
              <Switch
                checked={privacy.showEmail}
                onCheckedChange={(checked) =>
                  setPrivacy({ ...privacy, showEmail: checked })
                }
              />
            </div>
          </div>

          <Button>Save Privacy Settings</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
          <CardDescription>
            Manage your data and download your information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Download Your Data</p>
              <p className="text-sm text-muted-foreground">
                Get a copy of your Tribe data
              </p>
            </div>
            <Button variant="outline">Request Download</Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

