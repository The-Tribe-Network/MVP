"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { authClient } from "@/lib/clients/auth-client"
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth"
import { useFormValidation } from "@/lib/hooks/use-form-validation"
import { FormField } from "./form-field"
import { SuccessState } from "../success-state"

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [formData, setFormData] = useState<ForgotPasswordFormData>({ email: "" })
  const { toast } = useToast()

  const { errors, validate, clearErrors } = useFormValidation({
    schema: forgotPasswordSchema,
    onValidationSuccess: async (data) => {
      setIsLoading(true)
      try {
        const result = await authClient.forgetPassword({
          email: data.email,
          redirectTo: "/reset",
        })

        if (result.error) {
          toast({
            title: "Error",
            description: result.error.message || "Failed to send reset email. Please try again.",
            variant: "destructive",
          })
        } else {
          setIsEmailSent(true)
          toast({
            title: "Email sent",
            description: "Check your email for password reset instructions.",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to send reset email. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    onValidationError: () => {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()
    validate(formData)
  }

  if (isEmailSent) {
    return (
      <SuccessState
        title="Check your email"
        description={`We've sent a password reset link to ${formData.email}`}
        secondaryText="Didn't receive the email? Check your spam folder or"
        onSecondaryAction={() => {
          setIsEmailSent(false)
          setFormData({ email: "" })
        }}
        secondaryActionText="try again"
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        id="email"
        label="Email address"
        type="email"
        placeholder="Enter your email address"
        value={formData.email}
        onChange={(e) => setFormData({ email: e.target.value })}
        error={errors.email}
        required
      />

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send reset instructions"}
      </Button>
    </form>
  )
}
