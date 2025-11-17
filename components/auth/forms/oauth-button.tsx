"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { signIn } from "@/lib/clients/auth-client"

interface OAuthButtonProps {
  provider: "google" | "github"
  children: React.ReactNode
  disabled?: boolean
}

export function OAuthButton({ provider, children, disabled }: OAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleOAuthSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn.social({
        provider,
        callbackURL: "/dashboard",
      })
    } catch (error) {
      console.error(`${provider} OAuth error:`, error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full bg-transparent"
      onClick={handleOAuthSignIn}
      disabled={disabled || isLoading}
    >
      {children}
    </Button>
  )
}
