"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useSignUpMutation } from "@/lib/hooks/use-auth-mutations"
import { useAuth } from "@/lib/providers/auth-provider"
import { signUpSchema, type SignUpFormData } from "@/lib/validations/auth"
import { useFormValidation } from "@/lib/hooks/use-form-validation"
import { FormField } from "./form-field"
import { OAuthSection } from "./oauth-section"
import { AUTH_CONSTANTS } from "@/lib/constants/auth"
import { Muted } from "@/components/ui/typography"

export function SignUpForm() {
  const signUpMutation = useSignUpMutation()
  const { error, clearError } = useAuth()

  const [formData, setFormData] = useState<SignUpFormData>({
    name: "",
    email: "",
    birthday: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })

  const { errors, validate, clearErrors } = useFormValidation({
    schema: signUpSchema,
    onValidationSuccess: (data) => {
      signUpMutation.mutate({
        name: data.name,
        email: data.email,
        password: data.password,
        birthday: data.birthday,
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
      <OAuthSection disabled={signUpMutation.isPending} />

      {/* Sign Up Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="name"
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          error={errors.name}
          required
        />

        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="Enter your email address"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          error={errors.email}
          required
        />

        <FormField
          id="birthday"
          label="Birthday"
          type="date"
          value={formData.birthday}
          onChange={(e) => setFormData((prev) => ({ ...prev, birthday: e.target.value }))}
          error={errors.birthday}
          required
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          placeholder="Create a password"
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
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
          error={errors.confirmPassword}
          required
        />

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))}
          />
          <Label
            htmlFor="terms"
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I agree to the{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </Label>
        </div>
        {errors.agreeToTerms && <p className="text-sm text-destructive">{errors.agreeToTerms}</p>}

        {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

        <Button type="submit" className="w-full" disabled={signUpMutation.isPending}>
          {signUpMutation.isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </div>
  )
}
