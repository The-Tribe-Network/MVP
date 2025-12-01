import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import {
  ChevronDownIcon,
  DoorOpenIcon,
  FlameIcon,
  Settings,
  Users,
  UserPlus,
  Shield,
  FileText,
  Calendar,
  Image,
  Bell,
  Share2,
  Crown,
  Trash2,
  UserCog
} from "lucide-react";

interface SidebarTitleDropdownProps extends React.ComponentProps<typeof DropdownMenu> {
  title: string;
}
export default function SidebarTitleDropdown({ title, ...props }: SidebarTitleDropdownProps) {
  return (
    <DropdownMenu {...props}>
      <SidebarMenuButton
        asChild
        className="data-[slot=sidebar-menu-button]:!p-1.5"
      >
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="w-full justify-between flex flex-row items-center hover:bg-transparent">
            <div className="flex flex-row items-center gap-2">
              <FlameIcon className="!size-5" />
              <span className="text-base font-semibold">{title}</span>
            </div>
            <ChevronDownIcon className="!size-5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
      </SidebarMenuButton>
      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg">
        {/* General Actions */}
        <DropdownMenuItem>
          <Users className="!size-5" />
          <span className="text-base font-semibold">View Members</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Bell className="!size-5" />
          <span className="text-base font-semibold">Notifications</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Share2 className="!size-5" />
          <span className="text-base font-semibold">Share Tribe</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Member Management (Admin/Moderator) */}
        <DropdownMenuItem>
          <UserPlus className="!size-5" />
          <span className="text-base font-semibold">Invite Members</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <UserCog className="!size-5" />
          <span className="text-base font-semibold">Manage Members</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Shield className="!size-5" />
          <span className="text-base font-semibold">Manage Permissions</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Content Management (Admin/Moderator) */}
        <DropdownMenuItem>
          <FileText className="!size-5" />
          <span className="text-base font-semibold">Moderate Content</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Calendar className="!size-5" />
          <span className="text-base font-semibold">Manage Events</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Image className="!size-5" />
          <span className="text-base font-semibold">Manage Media</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Tribe Settings (Admin/Owner) */}
        <DropdownMenuItem>
          <Settings className="!size-5" />
          <span className="text-base font-semibold">Tribe Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Crown className="!size-5" />
          <span className="text-base font-semibold">Transfer Ownership</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Destructive Actions */}
        <DropdownMenuItem className="text-destructive">
          <DoorOpenIcon className="!size-5 text-destructive" />
          <span className="text-base font-semibold">Leave Tribe</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">
          <Trash2 className="!size-5 text-destructive" />
          <span className="text-base font-semibold">Delete Tribe</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}