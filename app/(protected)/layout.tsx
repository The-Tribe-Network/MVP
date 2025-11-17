import AppSidebar from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireAuth } from "@/lib/services/auth";
import { ToastProvider } from "@/lib/providers/toast-provider";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect to /sign-in if user is not authenticated for all route under this layout
  await requireAuth();

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
          {children}
        </ToastProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
