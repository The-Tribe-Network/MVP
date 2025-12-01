"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { H1, P, Muted } from "@/components/ui/typography"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AUTH_PAGES } from "@/lib/constants/auth"

export function AuthLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const config = AUTH_PAGES[pathname as keyof typeof AUTH_PAGES]
  
  if (!config) {
    return <div>{children}</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <H1 className="text-3xl font-bold">{config.title}</H1>
          <Muted>{config.subtitle}</Muted>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">{config.cardTitle}</CardTitle>
            <CardDescription className="text-center">{config.cardDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
        </Card>

        {config.footerLink && config.footerLinkText && <div className="text-center text-sm">
          <Muted>{config.footerText} </Muted>
          <Link href={config.footerLink} className="text-primary hover:underline font-medium">
            {config.footerLinkText}
          </Link>
        </div>}
      </div>
    </div>
  )
}
