import { getServerUser, logout } from "@/lib/services/auth"

import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/user-avatar"

export async function UserProfile() {
  const user = await getServerUser()

  if (!user) {
    throw new Error("User not found")
  }

  const { image, email, name } = user

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <UserAvatar image={image} email={email} name={name} className="h-12 w-12" />
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>{email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">User ID</Badge>
          <span className="text-sm font-mono">{user?.id}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="outline">Status</Badge>
          <span className="text-sm">Active</span>
        </div>

        <Button onClick={logout} variant="destructive" className="w-full">
          Sign Out
        </Button>
      </CardContent>
    </Card>
  )
}
