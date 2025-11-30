import AppSidebar from "@/components/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireAuth } from "@/lib/services/auth";
import { isProfileComplete } from "@/lib/services/user";
import { ToastProvider } from "@/lib/providers/toast-provider";
import { TribeDashboardToolbar } from "@/components/tribe-dashboard-toolbar";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect to /sign-in if user is not authenticated for all route under this layout
  const user = await requireAuth();

  // Check if profile is complete - redirect to welcome if not
  // Exception: Allow access to /welcome page itself
  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || "";

  if (!pathname.includes("/welcome")) {
    const profileComplete = await isProfileComplete(user.id);
    if (!profileComplete) {
      redirect("/welcome");
    }
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <ToastProvider>
          <TribeDashboardToolbar />
          <div className="container mx-auto px-4 pt-6 min-h-[calc(100vh-64px)] h-full">
            {children}
          </div>
        </ToastProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
