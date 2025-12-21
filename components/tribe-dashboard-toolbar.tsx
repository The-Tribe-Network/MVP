'use client'

import { Bell, MessageSquare, Megaphone, User, Search, PlusIcon, Mail, Badge } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { usePathname, useParams } from 'next/navigation'
import { SidebarTrigger } from './ui/sidebar'
import { Separator } from './ui/separator'
import { ViewInvitesDropdown } from './dropdowns/view-invites'
import { TooltipButton } from './ui/tooltip-button'
import { useState } from 'react'
import { NotificationsDrawer } from '@/components/notifications-drawer'

export function TribeDashboardToolbar() {
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState(false)

  const pathname = usePathname()
  const { tribe_id, post_id } = useParams<{ tribe_id: string, post_id?: string }>();

  const getTitle = () => {
    switch (pathname) {
      case `/tribe/${tribe_id}`:
        return 'Dashboard';
      case `/tribe/${tribe_id}/media`:
        return 'Media';
      case `/tribe/${tribe_id}/settings`:
        return 'Settings';
      case `/tribe/${tribe_id}/post/${post_id}`:
        return 'Post';
      case `/tribe/${tribe_id}/events`:
        return 'Events';
      case `/new`:
        return 'Create New Tribe';
      case `/discover`:
        return 'Discover';
      case `/dashboard`:
        return 'Dashboard';
      case `/profile`:
        return 'Profile';
      case `/settings`:
        return 'Settings';
      case `/help`:
        return 'Help';
      default:
        return 'Dashboard';
    }
  }

  return (
    <div className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
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
            <h1 className="text-xl font-semibold">Tribe</h1>
          </div>

          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search in tribe..."
                className="w-full pl-10 bg-white/95 dark:bg-white/10 border-white/20"
              />
            </div>
          </div>

          {/* Right side - Icons and User Menu */}
          <div className="flex items-center gap-2">
            <ViewInvitesDropdown />

            <TooltipButton message="Announcements" variant="ghost" size="icon">
              <Megaphone className="h-5 w-5" />
            </TooltipButton>

            <TooltipButton message="Messages" variant="ghost" size="icon" className="relative">
              <MessageSquare className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </TooltipButton>

            <TooltipButton message="Notifications" variant="ghost" size="icon" className="relative" onClick={() => setIsNotificationsDrawerOpen(true)}>
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </TooltipButton>
          </div>
        </div>
      </div>
    </div>
  )
}
