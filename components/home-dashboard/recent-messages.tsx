import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Message } from './types'

interface RecentMessagesProps {
  messages: Message[]
}

export function RecentMessages({ messages }: RecentMessagesProps) {
  const unreadCount = messages.filter((m) => m.unread).length

  return (
    <Card className="border-border/50 bg-card/50">
      <div className="border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Recent Messages</h3>
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
            {unreadCount}
          </Badge>
        </div>
      </div>

      <ScrollArea className="h-[280px]">
        <div className="divide-y divide-border/50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 p-4 transition-colors hover:bg-muted/50 ${message.unread ? 'bg-purple-500/5' : ''
                }`}
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
                <div className="h-2 w-2 rounded-full bg-purple-500" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}

