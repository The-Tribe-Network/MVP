
import type { Metadata } from "next";
import { Geist, Manrope } from "next/font/google";
import { Analytics } from '@vercel/analytics/next';

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Tribe - Community Organization, Perfected",
    template: "%s | Tribe",
  },
  description: "The privacy-first platform for communities. Better photo archiving, granular permissions, and structured events. No ads, no data mining. Built for groups and communities that gather in person.",
  keywords: [
    "community platform",
    "social group",
    "club",
    "group management",
    "photo sharing",
    "event management",
    "privacy-first",
    "no ads",
    "community organization",
    "diaspora community",
    "Greek life",
  ],
  authors: [{ name: "Tribe" }],
  creator: "Tribe",
  publisher: "Tribe",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Tribe - Community Organization, Perfected",
    description: "The privacy-first platform for communities that deserve better than GroupMe chaos and Instagram ephemerality.",
    siteName: "Tribe",
    images: [
      {
        url: "/app-screenshots-1024/tribe_dashboard_light.png",
        width: 1024,
        height: 768,
        alt: "Tribe community dashboard showing posts, events, and member activity",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tribe - Community Organization, Perfected",
    description: "Privacy-first community platform with photo archives, event management, and granular permissions.",
    images: ["/app-screenshots-1024/tribe_dashboard_light.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};


export default async function RootLayout({
  children,
}: LayoutProps<'/'>) {
  console.log("VERCEL_ENV", process.env.VERCEL_ENV);
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
            <Analytics />
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
