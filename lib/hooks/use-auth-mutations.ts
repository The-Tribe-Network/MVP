"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { signIn, signUp, requestPasswordReset, resetPassword, signOut } from "@/lib/clients/auth-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AUTH_MESSAGES } from "@/lib/constants/auth"
import { queryKeys } from "../constants/query-keys"

export function useSignInMutation() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const result = await signIn.email(data)
      if (result.error) {
        throw new Error(result.error.message)
      }
      return result.data
    },
    onSuccess: (data) => {
      // Optimistically set the session in cache
      queryClient.setQueryData(queryKeys.auth.user(), data.user ?? undefined);
      toast.success("Signed in successfully")
      router.push("/dashboard")
    },
    onError: (error: Error) => {
      toast.error("Sign in failed", {
        description: error.message,
      })
    },
  })
}

export function useSignUpMutation() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name: string
      email: string
      password: string
      birthday: string
    }) => {
      const result = await signUp.email(data)
      if (result.error) {
        throw new Error(result.error.message)
      }
      return result
    },
    onSuccess: ({ data: { user }}) => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ["auth", "session"] })
        toast.success("Signed up successfully", {
          description: AUTH_MESSAGES.SUCCESS.SIGN_UP,
        })
        router.push("/dashboard")
      }
    },
    onError: (error: Error) => {
      toast.error('Error', {
        description: error.message,
      })
    },
  })
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const result = await requestPasswordReset(data)
      if (result.error) {
        throw new Error(result.error.message)
      }
      return result
    },
    onSuccess: () => {
      toast.success("Password reset email sent", {
        description: AUTH_MESSAGES.SUCCESS.PASSWORD_RESET_EMAIL,
      })
    },
    onError: (error: Error) => {
      toast.error("Error", {
        description: error.message,
      })
    },
  })
}

export function useResetPasswordMutation() {
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: { password: string; token: string }) => {
      const result = await resetPassword({
        newPassword: data.password,
        token: data.token,
      })
      if (result.error) {
        throw new Error(result.error.message)
      }
      return result
    },
    onSuccess: () => {
      toast.success("Password reset successfully", {
        description: AUTH_MESSAGES.SUCCESS.PASSWORD_RESET,
      })
      router.push("/sign-in")
    },
    onError: (error: Error) => {
      toast.error("Error", {
        description: error.message,
      })
    },
  })
}

export function useSignOutMutation() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await signOut()
    },
    onSuccess: () => {
      queryClient.clear()
      toast.success("Signed out successfully", {
        description: AUTH_MESSAGES.SUCCESS.SIGN_OUT,
      })
      router.push("/")
    },
    onError: (error: Error) => {
      toast.error("Error", {
        description: "Failed to sign out. Please try again.",
      })
    },
  })
}
