"use client";

import { AppURLPath } from "@/lib/@types";
import { FileIcon, HomeIcon, SettingsIcon, Users, Bell, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export type SidebarNavItem = {
    title: string,
    url: AppURLPath,
    icon?: React.ReactNode,
    badge?: string;
};

const navItems: SidebarNavItem[] = [
    {
        title: "Home",
        url: "/dashboard/",
        icon: <HomeIcon className="h-4 w-4" />,
    },
    {
        title: "Mentions",
        url: "/dashboard/mentions",
        icon: <AtSign className="h-4 w-4" />,
        badge: "3",
    },
    {
        title: "Members",
        url: "/dashboard/members",
        icon: <Users className="h-4 w-4" />,
    },
    {
        title: "Notifications",
        url: "/dashboard/notifications",
        icon: <Bell className="h-4 w-4" />,
    },
    {
        title: "Posts",
        url: "/dashboard/posts",
        icon: <FileIcon className="h-4 w-4" />,
    },
    {
        title: "Settings",
        url: "/dashboard/settings",
        icon: <SettingsIcon className="h-4 w-4" />,
    }
];

export function SidebarNavigation() {
    const pathname = usePathname();

    return (
        <div className="px-2 py-2">
            <div className="space-y-1">
                {navItems.map((item) => (
                    <Link key={item.url} href={item.url}>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start px-2 py-2 h-8 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800",
                                pathname === item.url && "bg-gray-700 text-gray-200"
                            )}
                        >
                            {item.icon}
                            <span className="ml-2">{item.title}</span>
                            {item.badge && (
                                <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                    {item.badge}
                                </span>
                            )}
                        </Button>
                    </Link>
                ))}
            </div>
        </div>
    )
}