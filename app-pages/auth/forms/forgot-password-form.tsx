"use client"

import { useState } from "react"
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
} from "@/components/ui/form"
import { toast } from "sonner"
import { authClient } from "@/lib/clients/auth-client"
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth"
import { SuccessState } from "../success-state"

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    try {
      const result = await authClient.forgetPassword({
        email: data.email,
        redirectTo: "/reset",
      })

      if (result.error) {
        toast.error("Error", {
          description: result.error.message || "Failed to send reset email. Please try again.",
        })
      } else {
        setSubmittedEmail(data.email)
        setIsEmailSent(true)
        toast.success("Email sent", {
          description: "Check your email for password reset instructions.",
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to send reset email. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <SuccessState
        title="Check your email"
        description={`We've sent a password reset link to ${submittedEmail}`}
        secondaryText="Didn't receive the email? Check your spam folder or"
        onSecondaryAction={() => {
          setIsEmailSent(false)
          form.reset()
        }}
        secondaryActionText="try again"
      />
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send reset instructions"}
        </Button>
      </form>
    </Form>
  )
}
