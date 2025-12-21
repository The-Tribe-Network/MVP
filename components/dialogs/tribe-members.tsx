"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Crown, Shield, MoreVertical, LogOut } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useSession } from "@/lib/clients/auth-client"
import { useTribe, useLeaveTribe } from "@/lib/hooks/use-tribes"
import { toast } from "sonner"

interface Member {
  id: string
  name: string
  username: string
  avatar: string
  role: "owner" | "admin" | "moderator" | "member"
  status: "online" | "offline" | "away"
  joinedDate: string
}

interface TribeMembersDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  tribeId: string
}

export default function TribeMembersDialog({ isOpen, onOpenChange, tribeId }: TribeMembersDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()
  const { data: tribe } = useTribe(tribeId)
  const leaveTribe = useLeaveTribe()

  const currentUserId = session?.user?.id
  const isOwner = tribe?.createdBy === currentUserId

  // Mock data - replace with actual data fetching
  const members: Member[] = [
    {
      id: "1",
      name: "Sarah Chen",
      username: "@sarahchen",
      avatar: "/serene-asian-woman.png",
      role: "owner",
      status: "online",
      joinedDate: "Jan 2023",
    },
    {
      id: "2",
      name: "Mike Ross",
      username: "@mikeross",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "admin",
      status: "online",
      joinedDate: "Feb 2023",
    },
    {
      id: "3",
      name: "Alex Kim",
      username: "@alexkim",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "moderator",
      status: "away",
      joinedDate: "Mar 2023",
    },
    {
      id: "4",
      name: "Emily Watson",
      username: "@emilyw",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "member",
      status: "online",
      joinedDate: "Apr 2023",
    },
    {
      id: "5",
      name: "James Wilson",
      username: "@jameswilson",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "member",
      status: "offline",
      joinedDate: "May 2023",
    },
    {
      id: "6",
      name: "Rachel Green",
      username: "@rachelg",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "member",
      status: "online",
      joinedDate: "Jun 2023",
    },
  ]

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getRoleIcon = (role: Member["role"]) => {
    if (role === "owner") return <Crown className="h-3 w-3" />
    if (role === "admin" || role === "moderator") return <Shield className="h-3 w-3" />
    return null
  }

  const getRoleColor = (role: Member["role"]) => {
    if (role === "owner") return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    if (role === "admin") return "bg-red-500/10 text-red-500 border-red-500/20"
    if (role === "moderator") return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    return "bg-muted text-muted-foreground"
  }

  const getStatusColor = (status: Member["status"]) => {
    if (status === "online") return "bg-green-500"
    if (status === "away") return "bg-yellow-500"
    return "bg-muted"
  }

  const handleLeaveTribe = async () => {
    if (!tribeId) return

    try {
      await leaveTribe.mutateAsync(tribeId)
      toast.success("Successfully left the tribe")
      onOpenChange(false)
      setShowLeaveDialog(false)
      router.push("/dashboard")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to leave tribe"
      toast.error(errorMessage)
      setShowLeaveDialog(false)
    }
  }

  const handleLeaveClick = () => {
    setShowLeaveDialog(true)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Tribe Members ({members.length})</DialogTitle>
              {tribeId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLeaveClick}
                  className="text-destructive hover:text-destructive"
                  disabled={leaveTribe.isPending}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Leave Tribe
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/5 border-white/10"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card ${getStatusColor(
                      member.status,
                    )}`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{member.name}</p>
                    {member.role !== "member" && (
                      <Badge variant="outline" className={`text-xs gap-1 ${getRoleColor(member.role)}`}>
                        {getRoleIcon(member.role)}
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{member.username}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground hidden sm:block">Joined {member.joinedDate}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Send Message</DropdownMenuItem>
                      <DropdownMenuItem>Change Role</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Remove Member</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}

            {filteredMembers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No members found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Tribe?</AlertDialogTitle>
            <AlertDialogDescription>
              {isOwner ? (
                <>
                  As the tribe owner, you cannot leave the tribe without transferring ownership first.
                  Please transfer ownership to another member before leaving.
                </>
              ) : (
                <>
                  Are you sure you want to leave this tribe? You will lose access to all tribe content and will need to be re-invited to join again.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={leaveTribe.isPending}>Cancel</AlertDialogCancel>
            {!isOwner && (
              <AlertDialogAction
                onClick={handleLeaveTribe}
                disabled={leaveTribe.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {leaveTribe.isPending ? "Leaving..." : "Leave Tribe"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

