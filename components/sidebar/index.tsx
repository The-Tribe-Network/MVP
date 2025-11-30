"use client";

import { FlameKindlingIcon, Home, Compass, Plus } from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "../ui/sidebar";
import { NavUser } from "./nav-user";
import { DEFAULT_USER_IMAGE } from "@/lib/constants/auth";
import { useAuth } from "@/lib/providers/auth-provider";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import TribeList from "./tribe-list";
import { useUserTribes } from "@/lib/hooks/use-tribes";
import { cn } from "@/lib/utils";
import TribeSidebar from "./tribe-nav";

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const pathname = usePathname();
  const { setOpen } = useSidebar();

  if (!user) return null;

  const { name, email, image } = user;

  const userName = name || email || "User";
  const userAvatar = image || DEFAULT_USER_IMAGE;
  const userEmail = email || "Not Applicable";

  const isTribeDashboard = pathname.startsWith("/tribe/");

  // Collapse the outer sidebar when the second sidebar is not visible
  useEffect(() => {
    if (!isTribeDashboard) {
      setOpen(false);
    }
  }, [isTribeDashboard, setOpen]);

  // Fetch user's tribes
  const { data: userTribes = [], isLoading: isLoadingTribes } = useUserTribes();

  // Skeleton component for tribe list loading state
  function TribeListSkeleton() {
    return (
      <>
        {Array.from({ length: 3 }).map((_, index) => (
          <SidebarMenuItem key={`skeleton-${index}`}>
            <SidebarMenuButton size="lg" className="md:h-8 md:p-0" disabled>
              <Skeleton className="size-8 rounded-md" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </>
    );
  }

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      {/* This is the first sidebar, it will act a navigation for the app */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader className="h-[64px] px-2 py-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard">
                <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <FlameKindlingIcon className="size-4" />
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarSeparator className="mx-auto !w-3/4" />
        <SidebarContent className="pt-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {isLoadingTribes ? (
                  <TribeListSkeleton />
                ) : (
                  <TribeList data={userTribes} pathname={pathname} />
                )}

                {/* Discover Button */}
                <SidebarMenuItem>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Link href="/discover">
                          <SidebarMenuButton
                            size="lg"
                            asChild
                            className={
                              cn(
                                "md:h-8 md:p-0",
                                pathname === "/discover" ?
                                  "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground" :
                                  "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"

                              )}
                          >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                              <Compass className="size-4" />
                            </div>
                          </SidebarMenuButton>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Discover</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </SidebarMenuItem>

                {/* Create New Tribe Button */}
                <SidebarMenuItem>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Link href="/new">
                          <SidebarMenuButton
                            size="lg"
                            asChild
                            className={
                              cn(
                                "md:h-8 md:p-0",
                                pathname === "/new" ?
                                  "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground" :
                                  "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                              )
                            }
                          >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                              <Plus className="size-4" />
                            </div>
                            {/* <span className="truncate text-sm">Create Tribe</span> */}
                          </SidebarMenuButton>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Create Tribe</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser
            user={{
              name: userName,
              email: userEmail,
              avatar: userAvatar,
            }}
          />
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar, it will act a navigation for within a tribe  */}
      {/* We disable collapsible and let it fill remaining space */}
      {isTribeDashboard === true && <TribeSidebar />}
    </Sidebar>
  );
}
