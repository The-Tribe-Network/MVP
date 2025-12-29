import type React from "react"
import { redirect } from "next/navigation"
import { redirectIfAuthenticated } from "@/lib/services/auth"
import { AuthLayoutContent } from "../../app-pages/auth/auth-layout-content"
import LandingPageHeader from "@/components/landing-page-header"

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Block access to auth routes in production only (allow preview deployments)
  // VERCEL_ENV is "production" | "preview" | "development" on Vercel
  // Falls back to NODE_ENV for local development
  const isProduction = process.env.VERCEL_ENV === "production" ||
    (process.env.VERCEL_ENV === undefined && process.env.NODE_ENV === "production");

  if (isProduction) {
    redirect("/coming-soon");
  }

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
