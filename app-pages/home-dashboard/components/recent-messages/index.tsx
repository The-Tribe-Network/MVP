import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageItem } from './message-item'
import { RecentMessagesEmpty } from './empty'
import type { Message } from '../../lib/types'

interface RecentMessagesProps {
  messages: Message[]
}

export default function RecentMessages({ messages }: RecentMessagesProps) {
  if (messages.length === 0) {
    return <RecentMessagesEmpty />
  }

  const unreadCount = messages.filter((m) => m.unread).length

  return (
    <Card className="border-border/50 bg-card/50">
      <div className="border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Recent Messages</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>

      <ScrollArea className="h-[280px]">
        <div className="divide-y divide-border/50">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}

