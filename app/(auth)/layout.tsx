import type React from "react"
import { redirectIfAuthenticated } from "@/lib/services/auth"
import { AuthLayoutContent } from "../../app-pages/auth/auth-layout-content"
import LandingPageHeader from "@/components/landing-page-header"

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Redirect to dashboard if user is already authenticated
  await redirectIfAuthenticated();

  return (
    <>
      <LandingPageHeader />
      <AuthLayoutContent>
        {children}
      </AuthLayoutContent>
    </>
  );
};
