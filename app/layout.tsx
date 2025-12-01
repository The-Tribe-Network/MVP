import type React from "react";
import type { Metadata } from "next";
import { Geist, Manrope } from "next/font/google";

import { getServerUser } from "@/lib/services/auth";
import { QueryProvider } from "@/lib/providers/query-provider";
import { AuthProvider } from "@/lib/providers/auth-provider";
import {
  getQueryClient,
  prefetchQuery,
  dehydrateQueryClient,
} from "@/lib/utils/query-server";
import { queryKeys } from "@/lib/constants/query-keys";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Authentication System",
  description: "Complete authentication system with better-auth",
  generator: "v0.app",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get server-side user data
  const initialUser = await getServerUser();

  // Create a QueryClient instance for server-side prefetching
  const queryClient = getQueryClient();

  // Prefetch user data in TanStack Query cache
  if (initialUser) {
    await prefetchQuery({
      queryClient,
      queryKey: queryKeys.auth.user(),
      initialData: initialUser,
    });
  }

  // Dehydrate the query client state to pass to the client
  const dehydratedState = dehydrateQueryClient(queryClient);

  return (
    <html
      lang="en"
      className={`${geist.variable} ${manrope.variable} antialiased`}
    >
      <body>
        <QueryProvider dehydratedState={dehydratedState}>
          <AuthProvider initialUser={initialUser}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
              <SonnerToaster />
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
