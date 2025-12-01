import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { TooltipContent, TooltipProvider, TooltipTrigger, Tooltip } from "@/components/ui/tooltip"
import { cn, getInitials } from "@/lib/utils";
import Link from "next/link"

interface TribeNavButtonProps {
  data: {
    id: string;
    name: string;
    avatar: string | null;
  }[];
  pathname: string
}

export default function Tribelist({ data, pathname }: TribeNavButtonProps) {
  return data.map((tribe) => {
    const initials = getInitials(tribe.name);
    const isActive = pathname.startsWith(`/tribe/${tribe.id}`);

    return (
      <SidebarMenuItem key={tribe.id}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Link href={`/tribe/${tribe.id}`}>
                <SidebarMenuButton
                  size="lg"
                  asChild
                  className="md:h-8 md:p-0"
                // isActive={isActive}
                >
                  <>
                    <Avatar className={cn("size-8 rounded-md", isActive && tribe.avatar ? "border-2 border-primary/50" : "")}>
                      <AvatarImage
                        src={tribe.avatar || undefined}
                        alt={tribe.name}

                      />
                      <AvatarFallback
                        className={cn(
                          "bg-sidebar-primary text-sidebar-primary-foreground text-xs rounded-md",
                          isActive ?
                            "bg-sidebar-primary text-sidebar-primary-foreground" :
                            "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </>
                  {/* <span className="truncate text-sm">{tribe.name}</span> */}
                </SidebarMenuButton>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{tribe.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SidebarMenuItem>
    );
  });
}