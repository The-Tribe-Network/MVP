"use client"

import { useEffect, useRef } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

/**
 * Toast code definitions
 * Map toast codes to their corresponding toast configurations
 */
const TOAST_CODES = {
  OAUTH_SUCCESS: {
    title: "Success",
    description: "You have been signed in successfully with OAuth.",
    variant: "default" as const,
  },
  SIGN_IN_SUCCESS: {
    title: "Success",
    description: "You have been signed in successfully.",
    variant: "default" as const,
  },
  SIGN_UP_SUCCESS: {
    title: "Success",
    description: "Your account has been created successfully.",
    variant: "default" as const,
  },
  PASSWORD_RESET_SUCCESS: {
    title: "Success",
    description: "Your password has been reset successfully.",
    variant: "default" as const,
  },
  PASSWORD_RESET_LINK_SENT: {
    title: "Success",
    description: "Password reset link has been sent to your email.",
    variant: "default" as const,
  },
  EMAIL_VERIFIED: {
    title: "Success",
    description: "Your email has been verified successfully.",
    variant: "default" as const,
  },
  GENERIC_ERROR: {
    title: "Error",
    description: "Something went wrong. Please try again.",
    variant: "destructive" as const,
  },
  UNAUTHORIZED: {
    title: "Unauthorized",
    description: "You don't have permission to access this resource.",
    variant: "destructive" as const,
  },
  UNAUTHORIZED_TRIBE_ACCESS: {
    title: "Unauthorized",
    description: "You don't have permission to access this tribe.",
    variant: "destructive" as const,
  },
  SESSION_EXPIRED: {
    title: "Session Expired",
    description: "Your session has expired. Please sign in again.",
    variant: "destructive" as const,
  },
  TRIBE_NOT_FOUND: {
    title: "Tribe Not Found",
    description: "The tribe you are looking for does not exist.",
    variant: "destructive" as const,
  },
} as const

type ToastCode = keyof typeof TOAST_CODES

/**
 * ToastProvider - Handles toast notifications based on URL search parameters
 * 
 * This provider reads the `toast_code` search parameter and displays the corresponding
 * toast notification. It's designed to work with server-side redirects.
 * 
 * Usage:
 * - redirect("/dashboard?toast_code=OAUTH_SUCCESS")
 * - redirect("/dashboard?toast_code=SIGN_IN_SUCCESS")
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const hasShownToast = useRef<string | null>(null)

  useEffect(() => {
    const toastCode = searchParams.get("toast_code") as ToastCode | null
    const currentParams = searchParams.toString()

    // Skip if no toast code or if we've already shown this toast
    if (!toastCode || hasShownToast.current === currentParams) {
      return
    }

    // Use setTimeout to ensure the toast system is fully initialized
    // This fixes a known issue where toasts may not display immediately after redirect
    const timeoutId = setTimeout(() => {
      // Check if the toast code exists in our mapping
      const toastConfig = TOAST_CODES[toastCode]

      if (toastConfig) {
        toast({
          title: toastConfig.title,
          description: toastConfig.description,
          variant: toastConfig.variant,
        })

        // Clean up the URL by removing the toast_code parameter
        const newSearchParams = new URLSearchParams(searchParams.toString())
        newSearchParams.delete("toast_code")
        const newSearch = newSearchParams.toString()
        const newUrl = newSearch ? `${pathname}?${newSearch}` : pathname
        router.replace(newUrl, { scroll: false })

        hasShownToast.current = currentParams
      }
    }, 100) // 100ms delay to ensure toast system is initialized

    return () => {
      clearTimeout(timeoutId)
    }
  }, [searchParams, router, pathname])

  // Reset the ref when pathname changes (new page navigation)
  useEffect(() => {
    hasShownToast.current = null
  }, [pathname])

  return <>{children}</>
}

// Export toast codes for use in server-side redirects
export { TOAST_CODES }
export type { ToastCode }

