"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { toast } from "sonner"
import { authClient } from "@/lib/clients/auth-client"
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations/auth"
import { SuccessState } from "../success-state"
import { ErrorState } from "../error-state"
import { AUTH_CONSTANTS } from "@/lib/constants/auth"

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordReset, setIsPasswordReset] = useState(false)
  const [isValidToken, setIsValidToken] = useState(true)
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      token: "",
    },
  })

  useEffect(() => {
    // Validate token on component mount
    if (!token) {
      setIsValidToken(false)
      return
    }

    setIsValidToken(true)
    form.setValue("token", token)
  }, [token, form])

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    try {
      const result = await authClient.resetPassword({
        newPassword: data.password,
        token: data.token,
      })

      if (result.error) {
        toast.error("Error", {
          description: result.error.message || "Failed to reset password. Please try again.",
        })
      } else {
        setIsPasswordReset(true)
        toast.success("Success", {
          description: "Your password has been reset successfully.",
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to reset password. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your new password"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs">
                {AUTH_CONSTANTS.PASSWORD_REQUIREMENTS}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm your new password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Resetting password..." : "Reset password"}
        </Button>
      </form>
    </Form>
  )
}
