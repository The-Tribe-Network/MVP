import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Message } from '../../lib/types'

interface MessageItemProps {
  message: Message
}

export function MessageItem({ message }: MessageItemProps) {
  return (
    <div
      className={`flex gap-3 p-4 transition-colors hover:bg-muted/50 ${message.unread ? 'bg-primary/5' : ''}`}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={message.user.avatar || "/placeholder.svg"} />
        <AvatarFallback>{message.user.name[0]}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">
            {message.user.name}
          </p>
          <span className="text-xs text-muted-foreground">
            {message.timestamp}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{message.tribe.name}</p>
        <p className="truncate text-sm text-muted-foreground">
          {message.message}
        </p>
      </div>

      {message.unread && (
        <div className="h-2 w-2 rounded-full bg-primary" />
      )}
    </div>
  )
}

