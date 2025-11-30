"use client"

import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { AUTH_CONSTANTS } from "@/lib/constants/auth"

interface PasswordRequirementsIndicatorProps {
  password: string
}

interface Requirement {
  label: string
  met: boolean
}

export function PasswordRequirementsIndicator({
  password,
}: PasswordRequirementsIndicatorProps) {
  const requirements: Requirement[] = [
    {
      label: "At least 8 characters",
      met: password.length >= AUTH_CONSTANTS.MIN_PASSWORD_LENGTH,
    },
    {
      label: "At least one uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      label: "At least one lowercase letter",
      met: /[a-z]/.test(password),
    },
    {
      label: "At least one number",
      met: /[0-9]/.test(password),
    },
  ]

  // Only show indicator if user has started typing
  if (password.length === 0) {
    return null
  }

  return (
    <div className="space-y-1.5 mt-1">
      {requirements.map((requirement, index) => (
        <div
          key={index}
          className="flex items-center gap-2 text-xs"
        >
          {requirement.met ? (
            <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
          ) : (
            <X className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          )}
          <span
            className={cn(
              "transition-colors",
              requirement.met
                ? "text-green-600 dark:text-green-500"
                : "text-muted-foreground"
            )}
          >
            {requirement.label}
          </span>
        </div>
      ))}
    </div>
  )
}

