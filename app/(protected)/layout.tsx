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

  // Get pathname - try multiple sources for reliability
  let pathname = headersList.get("x-invoke-path") ||
    headersList.get("x-pathname") ||
    "";

  // Get referer for fallback pathname detection and loop prevention
  const referer = headersList.get("referer");

  // Fallback: extract from referer header if available
  if (!pathname && referer) {
    try {
      const urlObj = new URL(referer);
      pathname = urlObj.pathname;
    } catch {
      // Invalid URL, continue
    }
  }

  // Check if we're on the welcome page
  const isWelcomePage = pathname && pathname.includes("/welcome");

  // Only check profile and redirect if we're NOT on the welcome page
  // Skip check if pathname is empty (can't determine current route) to prevent loops
  // The welcome page itself will handle the profile check
  if (pathname && !isWelcomePage) {
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
