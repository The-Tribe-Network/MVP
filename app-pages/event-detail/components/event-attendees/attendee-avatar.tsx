import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { User } from '@/lib/database/types'

interface AttendeeAvatarProps {
  user: User
}

export function AttendeeAvatar({ user }: AttendeeAvatarProps) {
  return (
    <Avatar className="h-10 w-10 border-2 border-background cursor-pointer hover:scale-110 transition-transform">
      <AvatarImage src={user.image || undefined} />
      <AvatarFallback>{user.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
    </Avatar>
  )
}
