import type { LayoutProps } from "@/.next/types/app/layout";
import { TribeDashboardToolbar } from "@/components/tribe-dashboard-toolbar";

export default function TribeDashboardLayout({ children }: LayoutProps) {
  return (
    <>
      <TribeDashboardToolbar />
      {children}
    </>
  )
}