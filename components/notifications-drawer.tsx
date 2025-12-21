"use client"

import { Bell, Heart, MessageCircle, UserPlus, Calendar, ImageIcon, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import Link from "next/link"

interface NotificationsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationsDrawer({ open, onOpenChange }: NotificationsDrawerProps) {
  const notifications = [
    {
      id: 1,
      type: "like",
      user: "Sarah Chen",
      avatar: "/serene-asian-woman.png",
      action: "liked your post",
      content: "Amazing hiking photos from last weekend!",
      tribe: "Hiking Adventures",
      timestamp: "2 minutes ago",
      read: false,
      link: "/post/1",
    },
    {
      id: 2,
      type: "comment",
      user: "Mike Ross",
      avatar: "/placeholder.svg?height=40&width=40",
      action: "commented on your post",
      content: "These are incredible! Which trail was this?",
      tribe: "Hiking Adventures",
      timestamp: "15 minutes ago",
      read: false,
      link: "/post/1",
    },
    {
      id: 3,
      type: "member",
      user: "Alex Kim",
      avatar: "/placeholder.svg?height=40&width=40",
      action: "joined",
      tribe: "Tech Innovators",
      timestamp: "1 hour ago",
      read: true,
      link: "/tribe/tech-innovators",
    },
    {
      id: 4,
      type: "event",
      user: "Emma Davis",
      avatar: "/placeholder.svg?height=40&width=40",
      action: "created an event",
      content: "Game Night - Friday 7PM",
      tribe: "College Friends",
      timestamp: "2 hours ago",
      read: true,
      link: "/tribe/college-friends/events",
    },
    {
      id: 5,
      type: "photo",
      user: "Mike Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      action: "added 5 photos to",
      content: "Summer Party 2024",
      tribe: "Family Squad",
      timestamp: "3 hours ago",
      read: true,
      link: "/albums/summer-party",
    },
    {
      id: 6,
      type: "announcement",
      user: "James Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
      action: "posted an announcement in",
      content: "Team meeting moved to Monday at 10 AM",
      tribe: "Work Crew",
      timestamp: "5 hours ago",
      read: true,
      link: "/tribe/work-crew",
    },
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />
      case "comment":
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case "member":
        return <UserPlus className="h-4 w-4 text-green-500" />
      case "event":
        return <Calendar className="h-4 w-4 text-purple-500" />
      case "photo":
        return <ImageIcon className="h-4 w-4 text-orange-500" />
      case "announcement":
        return <Megaphone className="h-4 w-4 text-yellow-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-full w-full sm:w-96">
        <div className="flex flex-col h-full">
          <DrawerHeader className="flex-row items-center justify-between space-y-0 border-b">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <DrawerTitle className="text-lg">Notifications</DrawerTitle>
              {unreadCount > 0 && (
                <Badge variant="default" className="ml-1">
                  {unreadCount}
                </Badge>
              )}
            </div>
          </DrawerHeader>

          {/* Tabs */}
          <Tabs defaultValue="all" className="flex-1 flex flex-col">
            <div className="px-4 pt-3">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
              </TabsList>
            </div>

            {/* All Notifications */}
            <TabsContent value="all" className="flex-1 mt-0">
              <ScrollArea className="h-[calc(100vh-140px)]">
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <Link
                      key={notification.id}
                      href={notification.link}
                      onClick={() => onOpenChange(false)}
                      className="block hover:bg-accent/50 transition-colors"
                    >
                      <div className={`p-4 relative ${!notification.read ? "bg-primary/5" : ""}`}>
                        <div className="flex gap-3">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={notification.avatar || "/placeholder.svg"} alt={notification.user} />
                            <AvatarFallback>{notification.user[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2">
                              <div className="flex-1">
                                <p className="text-sm">
                                  <span className="font-semibold">{notification.user}</span>{" "}
                                  <span className="text-muted-foreground">{notification.action}</span>{" "}
                                  {notification.tribe && <span className="font-semibold">{notification.tribe}</span>}
                                </p>
                                {notification.content && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {notification.content}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">{notification.timestamp}</p>
                              </div>
                              <div className="flex-shrink-0">{getIcon(notification.type)}</div>
                            </div>
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Unread Notifications */}
            <TabsContent value="unread" className="flex-1 mt-0">
              <ScrollArea className="h-[calc(100vh-140px)]">
                {unreadCount === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                    <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <h3 className="font-semibold text-lg">All caught up!</h3>
                    <p className="text-sm text-muted-foreground mt-1">You have no unread notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications
                      .filter((n) => !n.read)
                      .map((notification) => (
                        <Link
                          key={notification.id}
                          href={notification.link}
                          onClick={() => onOpenChange(false)}
                          className="block hover:bg-accent/50 transition-colors"
                        >
                          <div className="p-4 bg-primary/5 relative">
                            <div className="flex gap-3">
                              <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarImage src={notification.avatar || "/placeholder.svg"} alt={notification.user} />
                                <AvatarFallback>{notification.user[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-2">
                                  <div className="flex-1">
                                    <p className="text-sm">
                                      <span className="font-semibold">{notification.user}</span>{" "}
                                      <span className="text-muted-foreground">{notification.action}</span>{" "}
                                      {notification.tribe && (
                                        <span className="font-semibold">{notification.tribe}</span>
                                      )}
                                    </p>
                                    {notification.content && (
                                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                        {notification.content}
                                      </p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">{notification.timestamp}</p>
                                  </div>
                                  <div className="flex-shrink-0">{getIcon(notification.type)}</div>
                                </div>
                              </div>
                            </div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                          </div>
                        </Link>
                      ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Button variant="ghost" className="w-full">
              Mark all as read
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
