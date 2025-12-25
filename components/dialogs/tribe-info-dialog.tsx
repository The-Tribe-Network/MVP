'use client'

import { useQuery } from '@tanstack/react-query'
import { MapPin, Users, Calendar } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { tribeDetailOptions } from '@/lib/query-options'
import { useDialogStore } from '@/lib/stores/dialog-store'

export function TribeInfoDialog() {
  const { isDialogOpen, selectedDialog, dialogPayload, closeDialog } = useDialogStore()

  const isOpen = isDialogOpen && selectedDialog === 'tribe-info-mobile'
  const tribeId = (dialogPayload as { tribeId: string } | null)?.tribeId

  const { data: tribe } = useQuery({
    ...tribeDetailOptions(tribeId),
    enabled: !!tribeId && isOpen,
  })

  if (!tribe) return null

  const avatarFallback = tribe.name.substring(0, 2).toUpperCase()
  const createdDate = new Date(tribe.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <Avatar className="h-20 w-20 border-4 border-primary/20">
              <AvatarImage src={tribe.avatar || '/placeholder.svg'} />
              <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          </div>
          <DialogTitle className="text-2xl">{tribe.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stats */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{tribe.memberCount} member{tribe.memberCount === 1 ? '' : 's'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Since {createdDate}</span>
            </div>
          </div>

          {/* Location */}
          {tribe.location && (
            <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{tribe.location}</span>
            </div>
          )}

          {/* Category Badge */}
          {tribe.category && (
            <div className="flex justify-center">
              <Badge variant="secondary" className="capitalize">
                {tribe.category}
              </Badge>
            </div>
          )}

          <Separator />

          {/* Description */}
          {tribe.description && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tribe.description}
              </p>
            </div>
          )}

          {/* Privacy */}
          <div className="flex justify-center">
            <Badge variant="outline" className="capitalize">
              {tribe.privacy} tribe
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
