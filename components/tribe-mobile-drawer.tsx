'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Image,
  Calendar,
  Settings,
  UserPlus,
  Users,
  Info,
  Bell,
  LogOut,
  Plus,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useDialogStore } from '@/lib/stores/dialog-store'
import { useQuery } from '@tanstack/react-query'
import { tribeDetailOptions } from '@/lib/query-options'

interface TribeMobileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tribeId: string
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '', icon: LayoutDashboard },
  { label: 'Media', href: '/media', icon: Image },
  { label: 'Events', href: '/events', icon: Calendar },
]

const ACTION_ITEMS = [
  { label: 'New Post', action: 'quick-post' as const, icon: Plus },
  { label: 'Invite Members', action: 'invite' as const, icon: UserPlus },
]

export function TribeMobileDrawer({ open, onOpenChange, tribeId }: TribeMobileDrawerProps) {
  const pathname = usePathname()
  const openDialog = useDialogStore((s) => s.openDialog)

  const { data: tribe } = useQuery(tribeDetailOptions(tribeId))

  const basePath = `/tribe/${tribeId}`

  const isActive = (href: string) => {
    const fullPath = `${basePath}${href}`
    if (href === '') {
      return pathname === basePath
    }
    return pathname.startsWith(fullPath)
  }

  const handleNavClick = () => {
    onOpenChange(false)
  }

  const handleActionClick = (action: 'quick-post' | 'invite') => {
    onOpenChange(false)
    if (action === 'quick-post') {
      openDialog('quick-post' as any, { tribeId })
    } else if (action === 'invite') {
      openDialog('invite', { tribeId, tribeName: tribe?.name || 'Tribe' })
    }
  }

  const handleTribeInfoClick = () => {
    onOpenChange(false)
    openDialog('tribe-info-mobile' as any, { tribeId })
  }

  const handleMembersClick = () => {
    onOpenChange(false)
    openDialog('tribe-members', { tribeId })
  }

  const avatarFallback = tribe?.name?.substring(0, 2).toUpperCase() || 'TR'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[300px] p-0">
        <SheetHeader className="p-4 pb-2">
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>

        {/* Tribe Info Header */}
        {tribe && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={tribe.avatar || '/placeholder.svg'} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{tribe.name}</p>
                <p className="text-sm text-muted-foreground">
                  {tribe.memberCount} member{tribe.memberCount === 1 ? '' : 's'}
                </p>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Navigation */}
        <div className="p-2">
          <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Navigation
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.label}
                  href={`${basePath}${item.href}`}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className="p-2">
          <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Quick Actions
          </p>
          <div className="space-y-1">
            {ACTION_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  onClick={() => handleActionClick(item.action)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
            <Link
              href={`${basePath}/events/new`}
              onClick={handleNavClick}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Calendar className="h-5 w-5" />
              <span>New Event</span>
            </Link>
          </div>
        </div>

        <Separator />

        {/* Tribe Actions */}
        <div className="p-2">
          <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Tribe
          </p>
          <div className="space-y-1">
            <button
              onClick={handleMembersClick}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Users className="h-5 w-5" />
              <span>Members</span>
            </button>
            <button
              onClick={handleTribeInfoClick}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Info className="h-5 w-5" />
              <span>Tribe Info</span>
            </button>
            <Link
              href={`${basePath}/settings`}
              onClick={handleNavClick}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
