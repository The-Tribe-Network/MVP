import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { SidebarNavigation } from "./navigation"
import UserProfileDropdown from "./user-profile-dropdown"
import { DiscordServerList } from "./discord-server-list"
import { DiscordChannelList } from "./discord-channel-list"

export default function AppSidebar() {
  return (
    <Sidebar className="border-r border-gray-800 bg-gray-900">
      <SidebarHeader className="border-b border-gray-800 p-4">
        <DiscordServerList />
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-hidden">
        <DiscordChannelList />
        <SidebarNavigation />
      </SidebarContent>
      <SidebarFooter className="border-t border-gray-800 p-2">
        <UserProfileDropdown />
      </SidebarFooter>
    </Sidebar>
  )
}

