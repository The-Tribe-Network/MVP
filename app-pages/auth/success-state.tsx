"use client"

import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { H3, P, Muted } from "@/components/ui/typography"
import Link from "next/link"

interface SuccessStateProps {
  title: string
  description: string
  actionText?: string
  actionHref?: string
  onAction?: () => void
  secondaryText?: string
  onSecondaryAction?: () => void
  secondaryActionText?: string
}

export function SuccessState({
  title,
  description,
  actionText,
  actionHref,
  onAction,
  secondaryText,
  onSecondaryAction,
  secondaryActionText,
}: SuccessStateProps) {
  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <CheckCircle className="h-12 w-12 text-green-500" />
      </div>
      <div className="space-y-2">
        <H3 className="text-lg font-semibold">{title}</H3>
        <Muted>{description}</Muted>
      </div>
      {(actionText || secondaryText) && (
        <div className="space-y-2">
          {actionText && (
            <>
              {actionHref ? (
                <Link href={actionHref}>
                  <Button className="w-full">{actionText}</Button>
                </Link>
              ) : (
                <Button className="w-full" onClick={onAction}>
                  {actionText}
                </Button>
              )}
            </>
          )}
          {secondaryText && (
            <Muted className="text-xs">
              {secondaryText}{" "}
              {onSecondaryAction && (
                <button
                  onClick={onSecondaryAction}
                  className="text-primary hover:underline"
                >
                  {secondaryActionText || "try again"}
                </button>
              )}
            </Muted>
          )}
        </div>
      )}
    </div>
  )
}
