'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

export function PreferencesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>App Preferences</CardTitle>
        <CardDescription>
          Customize how Tribe works for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <Select defaultValue="dark">
            <SelectTrigger id="theme">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultView">Default View</Label>
          <Select defaultValue="feed">
            <SelectTrigger id="defaultView">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="feed">Activity Feed</SelectItem>
              <SelectItem value="timeline">Timeline</SelectItem>
              <SelectItem value="tribes">My Tribes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Content Preferences</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-play Videos</Label>
              <p className="text-xs text-muted-foreground">
                Videos start playing automatically
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Read Posts</Label>
              <p className="text-xs text-muted-foreground">
                Display posts you've already seen
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compact Mode</Label>
              <p className="text-xs text-muted-foreground">
                Show more content with smaller cards
              </p>
            </div>
            <Switch />
          </div>
        </div>

        <Button>Save Preferences</Button>
      </CardContent>
    </Card>
  )
}

