import { Button } from "@/components/ui/button";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Users } from "lucide-react";

interface TribeInfoWidgetProps {
  tribeName: string;
  tribeDescription: string;
  tribeMembers: number;
  tribeAvatar?: string;
};

export const mockTribeInfoWidgetData = {
  tribeName: "The Crew",
  tribeDescription: "Our tight-knit community of friends sharing life&apos;s moments together",
  tribeMembers: 24,
};

export default function TribeInfoWidget({
  tribeName,
  tribeDescription,
  tribeMembers,
  tribeAvatar,
}: TribeInfoWidgetProps) {
  const avatarFallback = tribeName.substring(0, 2).toUpperCase()

  return (
    <Card>
      <CardHeader className="text-center pb-3">
        <div className="flex justify-center mb-4">
          <Avatar className="h-24 w-24 border-4 border-primary/20">
            <AvatarImage src={tribeAvatar || "/placeholder.svg"} />
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">{avatarFallback}</AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-2xl">{tribeName}</CardTitle>
        <CardDescription className="text-balance">
          {tribeDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="font-medium">{tribeMembers.toLocaleString()} members</span>
        </div>

        <Button className="w-full" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Members
        </Button>
      </CardContent>
    </Card>
  )
}