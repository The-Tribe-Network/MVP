"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { H3, Muted } from "@/components/ui/typography"
import Link from "next/link"

interface ErrorStateProps {
  title: string
  description: string
  actionText?: string
  actionHref?: string
  onAction?: () => void
}

export function ErrorState({
  title,
  description,
  actionText,
  actionHref,
  onAction,
}: ErrorStateProps) {
  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <div className="space-y-2">
        <H3 className="text-lg font-semibold">{title}</H3>
        <Muted>{description}</Muted>
      </div>
      {actionText && (
        <div className="space-y-2">
          {actionHref ? (
            <Link href={actionHref}>
              <Button className="w-full">{actionText}</Button>
            </Link>
          ) : (
            <Button className="w-full" onClick={onAction}>
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
