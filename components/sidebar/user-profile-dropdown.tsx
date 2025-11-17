"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/providers/auth-provider";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Settings,
  LogOut,
  User,
  Mic,
  MicOff,
  Headphones,
  HeadphoneOff,
  Monitor,
  Moon
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function UserProfileDropdown() {
  const { user } = useAuth();
  const { isMobile } = useSidebar();

  if (!user) return null;

  const { image, email, name } = user;
  const userName = name || email || "User";
  const status = "Online"; // You can make this dynamic based on user status

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full h-12 p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="relative">
                  <div className="h-8 w-8">
                    <UserAvatar
                      image={image}
                      email={email}
                      name={name}
                    />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-gray-900" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium text-gray-200 truncate">
                    {userName}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {status}
                  </div>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 p-2 bg-gray-800 border-gray-700"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10">
                  <UserAvatar
                    image={image}
                    email={email}
                    name={name}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-200 truncate">
                    {userName}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {email}
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-gray-700" />

            <DropdownMenuItem className="flex items-center gap-3 p-2 text-gray-200 hover:bg-gray-700 cursor-pointer">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex items-center gap-3 p-2 text-gray-200 hover:bg-gray-700 cursor-pointer">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-gray-700" />

            <div className="p-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                >
                  <Headphones className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <DropdownMenuSeparator className="bg-gray-700" />

            <DropdownMenuItem className="flex items-center gap-3 p-2 text-red-400 hover:bg-gray-700 cursor-pointer">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
