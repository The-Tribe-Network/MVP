'use client'

import { Bell, MessageSquare, Megaphone, Menu } from 'lucide-react'
import { usePathname, useParams } from 'next/navigation'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SidebarTrigger } from './ui/sidebar'
import { Separator } from './ui/separator'
import { ViewInvitesDropdown } from './dropdowns/view-invites'
import { TooltipButton } from './ui/tooltip-button'
import { NotificationsDrawer } from '@/components/notifications-drawer'
import { TribeHeaderNav } from '@/components/tribe-header-nav'
import { TribeMobileDrawer } from '@/components/tribe-mobile-drawer'
import { tribeDetailOptions } from '@/lib/query-options'

export function TribeDashboardToolbar() {
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState(false)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  const pathname = usePathname()
  const { tribe_id } = useParams<{ tribe_id: string }>();

  // Fetch tribe data for the header nav
  const { data: tribe } = useQuery({
    ...tribeDetailOptions(tribe_id),
    enabled: !!tribe_id,
  })

  // Check if we're in a tribe context
  const isTribeContext = pathname.startsWith('/tribe/') && tribe_id

  return (
    <div
      data-tour="toolbar"
      className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60"
    >
      <NotificationsDrawer open={isNotificationsDrawerOpen} onOpenChange={setIsNotificationsDrawerOpen} />
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left side - Toggle and Title */}
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="data-[orientation=vertical]:h-4"
            />
            <h1 className="text-xl font-semibold truncate max-w-[120px] lg:max-w-none">
              {tribe?.name || 'Tribe'}
            </h1>
          </div>

          {/* Center - Navigation tabs (desktop only, tribe context only) */}
          {/* {isTribeContext && (
            <TribeHeaderNav
              tribeId={tribe_id}
              tribeName={tribe?.name}
              className="hidden lg:flex"
            />
          )} */}

          {/* Right side - Icons and User Menu */}
          <div data-tour="toolbar-buttons" className="flex items-center gap-2">
            <ViewInvitesDropdown />

            <TooltipButton message="Announcements" variant="ghost" size="icon" className="hidden sm:inline-flex">
              <Megaphone className="h-5 w-5" />
            </TooltipButton>

            <TooltipButton message="Messages" variant="ghost" size="icon" className="relative hidden sm:inline-flex">
              <MessageSquare className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </TooltipButton>

            <TooltipButton message="Notifications" variant="ghost" size="icon" className="relative" onClick={() => setIsNotificationsDrawerOpen(true)}>
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </TooltipButton>

            {/* Mobile menu trigger (tribe context only) */}
            {isTribeContext && (
              <TooltipButton
                message="Menu"
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileDrawerOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </TooltipButton>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {isTribeContext && tribe_id && (
        <TribeMobileDrawer
          open={isMobileDrawerOpen}
          onOpenChange={setIsMobileDrawerOpen}
          tribeId={tribe_id}
        />
      )}
    </div>
  )
}
