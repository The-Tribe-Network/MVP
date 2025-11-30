'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SettingsHeader } from './settings-header'
import { ProfileTab } from './profiles/profile-tab'
import { AccountTab } from './account-tab'
import { NotificationsTab } from './notifications-tab'
import { PrivacyTab } from './privacy-tab'
import { SecurityTab } from './security-tab'
import { InvitesTab } from './invites-tab'
import { SubscriptionsTab } from './subscriptions-tab'
import { PreferencesTab } from './preferences-tab'
import { useSearchParams } from 'next/navigation'

export default function SettingsPageContent() {
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') || 'profile'

  return (
    <div className="flex h-screen overflow-hidden">
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <SettingsHeader />

          <Tabs defaultValue={tab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="invites">Invites</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <ProfileTab />
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <AccountTab />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <NotificationsTab />
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <PrivacyTab />
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <SecurityTab />
            </TabsContent>

            <TabsContent value="invites" className="space-y-6">
              <InvitesTab />
            </TabsContent>

            <TabsContent value="subscriptions" className="space-y-6">
              <SubscriptionsTab />
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <PreferencesTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
