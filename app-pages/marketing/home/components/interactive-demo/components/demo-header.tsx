'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import type { DemoTribe } from '../types'

interface DemoHeaderProps {
  tribe: DemoTribe
}

export function DemoHeader({ tribe }: DemoHeaderProps) {
  const avatarFallback = tribe.name.substring(0, 2).toUpperCase()

  return (
    <div className="relative flex-shrink-0">
      {/* Banner */}
      <div className="w-full aspect-[4/1] lg:aspect-[5/1] overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background">
        <img
          src={tribe.banner}
          alt={`${tribe.name} banner`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Overlay bar with avatar + name */}
      <div className="relative bg-background">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <div className="flex items-center gap-3 md:gap-4 py-2 md:py-3">
            {/* Avatar - positioned to overlap banner */}
            <div className="-mt-8 md:-mt-10 lg:-mt-12">
              <Avatar className="h-14 w-14 md:h-18 md:w-18 lg:h-20 lg:w-20 border-4 border-background shadow-lg">
                <AvatarImage src={tribe.avatar} alt={tribe.name} />
                <AvatarFallback className="text-lg md:text-xl lg:text-2xl bg-primary text-primary-foreground">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Tribe name */}
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold truncate">
                {tribe.name}
              </h1>

              {/* Invite Button (decorative in demo) */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-default"
                disabled
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
