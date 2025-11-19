"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSignInMutation } from "@/lib/hooks/use-auth-mutations"
import { useAuth } from "@/lib/providers/auth-provider"
import { signInSchema, type SignInFormData } from "@/lib/validations/auth"
import { useFormValidation } from "@/lib/hooks/use-form-validation"
import { FormField } from "./form-field"
import { OAuthSection } from "./oauth-section"

export function SignInForm() {
  const signInMutation = useSignInMutation()
  const { error, clearError } = useAuth()

  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: "",
  })

  const { errors, validate, clearErrors } = useFormValidation({
    schema: signInSchema,
    onValidationSuccess: (data) => {
      signInMutation.mutate({
        email: data.email,
        password: data.password,
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()
    clearError()
    validate(formData)
  }

  return (
    <div className="space-y-4">
      <OAuthSection disabled={signInMutation.isPending} />

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          error={errors.email}
          required
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
          error={errors.password}
          required
        />

        <div className="flex items-center justify-between">
          <Link href="/forgot" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

        <Button type="submit" className="w-full" disabled={signInMutation.isPending}>
          {signInMutation.isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  )
}
