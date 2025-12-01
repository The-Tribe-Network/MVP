"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { authClient } from "@/lib/clients/auth-client"
import { resetPasswordSchema } from "@/lib/validations/auth"
import { useFormValidation } from "@/lib/hooks/use-form-validation"
import { FormField } from "./form-field"
import { SuccessState } from "../success-state"
import { ErrorState } from "../error-state"
import { AUTH_CONSTANTS } from "@/lib/constants/auth"
import { Muted } from "@/components/ui/typography"

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordReset, setIsPasswordReset] = useState(false)
  const [isValidToken, setIsValidToken] = useState(true)
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    token: "",
  })
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const { errors, validate, clearErrors } = useFormValidation({
    schema: resetPasswordSchema,
    onValidationSuccess: async (data) => {
      setIsLoading(true)
      try {
        const result = await authClient.resetPassword({
          newPassword: data.password,
          token: data.token,
        })

        if (result.error) {
          toast({
            title: "Error",
            description: result.error.message || "Failed to reset password. Please try again.",
            variant: "destructive",
          })
        } else {
          setIsPasswordReset(true)
          toast({
            title: "Success",
            description: "Your password has been reset successfully.",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to reset password. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    onValidationError: () => {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive",
      })
    },
  })

  useEffect(() => {
    // Validate token on component mount
    if (!token) {
      setIsValidToken(false)
      return
    }

    setIsValidToken(true)
    setFormData((prev) => ({ ...prev, token }))
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()
    validate(formData)
  }

  if (!isValidToken) {
    return (
      <ErrorState
        title="Invalid or expired link"
        description="This password reset link is invalid or has expired."
        actionText="Request new reset link"
        actionHref="/forgot"
      />
    )
  }

  if (isPasswordReset) {
    return (
      <SuccessState
        title="Password reset successful"
        description="Your password has been updated successfully. You can now sign in with your new password."
        actionText="Continue to sign in"
        actionHref="/sign-in"
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        id="password"
        label="New Password"
        type="password"
        placeholder="Enter your new password"
        value={formData.password}
        onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
        error={errors.password}
        required
        minLength={8}
      />
      <Muted className="text-xs">
        {AUTH_CONSTANTS.PASSWORD_REQUIREMENTS}
      </Muted>

      <FormField
        id="confirmPassword"
        label="Confirm New Password"
        type="password"
        placeholder="Confirm your new password"
        value={formData.confirmPassword}
        onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
        error={errors.confirmPassword}
        required
        minLength={8}
      />

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Resetting password..." : "Reset password"}
      </Button>
    </form>
  )
}
