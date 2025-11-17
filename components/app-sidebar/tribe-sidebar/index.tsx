import { SidebarContent, SidebarFooter } from "@/components/ui/sidebar";

import { Sidebar, SidebarHeader } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export default function TribeSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar collapsible="none" className="hidden flex-1 md:flex">
      <SidebarHeader>

      </SidebarHeader>
      <SidebarContent>

      </SidebarContent>
      <SidebarFooter>

      </SidebarFooter>
    </Sidebar>
  );
};