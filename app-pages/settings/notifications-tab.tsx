'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { NotificationSettings } from './types'

export function NotificationsTab() {
  const [notifications, setNotifications] = useState<NotificationSettings>({
    posts: true,
    comments: true,
    likes: true,
    mentions: true,
    events: true,
    messages: true,
    announcements: true,
    emailDigest: false,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose what notifications you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Push Notifications</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New Posts</Label>
              <p className="text-xs text-muted-foreground">
                When someone posts in your tribe
              </p>
            </div>
            <Switch
              checked={notifications.posts}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, posts: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Comments</Label>
              <p className="text-xs text-muted-foreground">
                When someone comments on your post
              </p>
            </div>
            <Switch
              checked={notifications.comments}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, comments: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Likes</Label>
              <p className="text-xs text-muted-foreground">
                When someone likes your post
              </p>
            </div>
            <Switch
              checked={notifications.likes}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, likes: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mentions</Label>
              <p className="text-xs text-muted-foreground">
                When someone mentions you
              </p>
            </div>
            <Switch
              checked={notifications.mentions}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, mentions: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Events</Label>
              <p className="text-xs text-muted-foreground">
                Event reminders and updates
              </p>
            </div>
            <Switch
              checked={notifications.events}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, events: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Messages</Label>
              <p className="text-xs text-muted-foreground">
                Direct messages from tribe members
              </p>
            </div>
            <Switch
              checked={notifications.messages}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, messages: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Announcements</Label>
              <p className="text-xs text-muted-foreground">
                Important tribe announcements
              </p>
            </div>
            <Switch
              checked={notifications.announcements}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, announcements: checked })
              }
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Email Notifications</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Daily Digest</Label>
              <p className="text-xs text-muted-foreground">
                Receive a daily summary of activity
              </p>
            </div>
            <Switch
              checked={notifications.emailDigest}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, emailDigest: checked })
              }
            />
          </div>
        </div>

        <Button>Save Preferences</Button>
      </CardContent>
    </Card>
  )
}

