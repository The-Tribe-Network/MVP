
import type { Metadata } from "next";
import { Geist, Manrope } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/lib/providers/query-provider";

import "./globals.css";

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
  title: "Tribe - Community Organization, Perfected",
  description: "The privacy-first platform for communities. Better photo archiving, granular permissions, and structured events. No ads, no data mining. Built for diaspora communities, Greek life, gyms, and more.",
  keywords: [
    "community platform",
    "photo sharing",
    "event management",
    "diaspora community",
    "Greek life",
    "privacy-first",
    "no ads",
    "community organization",
  ],
  authors: [{ name: "Tribe" }],
  creator: "Tribe",
  publisher: "Tribe",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    title: "Tribe - Community Organization, Perfected",
    description: "The privacy-first platform for communities that deserve better than GroupMe chaos and Instagram ephemerality.",
    siteName: "Tribe",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tribe - Community Organization, Perfected",
    description: "Privacy-first community platform with photo archives, event management, and granular permissions.",
  },
};

export default async function RootLayout({
  children,
}: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${manrope.variable} antialiased`}
    >
      <body>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
