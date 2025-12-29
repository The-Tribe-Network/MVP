import { redirect } from "next/navigation";
import AppSidebar from "@/components/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireAuth } from "@/lib/services/auth";
import { ToastProvider } from "@/lib/providers/toast-provider";
import { TribeDashboardToolbar } from "@/components/tribe-dashboard-toolbar";
import { ProfileCompletionGuard } from "@/components/profile-completion-guard";
import { GlobalDialogContainer } from "@/components/dialogs/global-dialog-container";
import { TourGuide } from "@/components/tour-guide";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Block access to protected routes in production only (allow preview deployments)
  // VERCEL_ENV is "production" | "preview" | "development" on Vercel
  // Falls back to NODE_ENV for local development
  const isProduction = process.env.VERCEL_ENV === "production" ||
    (process.env.VERCEL_ENV === undefined && process.env.NODE_ENV === "production");

  if (isProduction) {
    redirect("/coming-soon");
  }

  // This will redirect to /sign-in if user is not authenticated for all route under this layout
  await requireAuth();

  return (
    <ProfileCompletionGuard>
      <TourGuide />
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
            <GlobalDialogContainer />
          </ToastProvider>
        </SidebarInset>
      </SidebarProvider>
    </ProfileCompletionGuard>
  );
}
