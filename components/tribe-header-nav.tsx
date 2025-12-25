'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Image, Calendar, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDialogStore } from '@/lib/stores/dialog-store'

interface TribeHeaderNavProps {
  tribeId: string
  tribeName?: string
  className?: string
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '', icon: LayoutDashboard },
  { label: 'Media', href: '/media', icon: Image },
  { label: 'Events', href: '/events', icon: Calendar },
]

export function TribeHeaderNav({ tribeId, tribeName, className }: TribeHeaderNavProps) {
  const pathname = usePathname()
  const openDialog = useDialogStore((s) => s.openDialog)

  const basePath = `/tribe/${tribeId}`

  const isActive = (href: string) => {
    const fullPath = `${basePath}${href}`
    if (href === '') {
      // Dashboard is active only on exact match
      return pathname === basePath
    }
    // Other routes are active if pathname starts with them
    return pathname.startsWith(fullPath)
  }

  return (
    <nav className={cn("flex items-center gap-1", className)}>
      {/* Navigation Links */}
      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.label}
              href={`${basePath}${item.href}`}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Quick Create Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="sm" className="gap-1.5 ml-2">
            <Plus className="h-4 w-4" />
            <span>Create</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => openDialog('quick-post', { tribeId })}>
            <span>New Post</span>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`${basePath}/events/new`}>
              <span>New Event</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`${basePath}/media?action=upload`}>
              <span>Upload Media</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openDialog('invite', { tribeId, tribeName: tribeName || 'Tribe' })}>
            <span>Invite Members</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  )
}
