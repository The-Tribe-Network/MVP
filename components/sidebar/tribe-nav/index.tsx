import { SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator } from "@/components/ui/sidebar";

import { Sidebar, SidebarHeader } from "@/components/ui/sidebar";
import { CalendarIcon, FlameIcon, HomeIcon, ImageIcon } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import SidebarTitleDropdown from "./title-dropdown";
import { NavMain } from "./nav-main";
import { useIsMobile } from "@/lib/hooks/use-mobile";

export default function TribeSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isMobile = useIsMobile();
  const { tribe_id: tribeId } = useParams<{ tribe_id: string }>();

  if (!tribeId) return null;
  if (isMobile && !tribeId) return null;

  return (
    <Sidebar collapsible="none" className="hidden flex-1 md:flex" {...props}>
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarTitleDropdown
              title="Acme Inc."
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <NavMain items={[
          {
            title: "Dashboard",
            url: `/tribe/${tribeId}`,
            icon: HomeIcon,
          },
          {
            title: "Media",
            url: `/tribe/${tribeId}/media`,
            icon: ImageIcon,
          },
          {
            title: "Events",
            url: `/tribe/${tribeId}/events`,
            icon: CalendarIcon,
          },
        ]} />
        {/* <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>

      </SidebarFooter>
    </Sidebar>
  );
};