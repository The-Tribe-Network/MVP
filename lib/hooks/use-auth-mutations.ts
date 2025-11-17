"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { signIn, signUp, forgetPassword, resetPassword, signOut } from "@/lib/clients/auth-client"
import { useAuth } from "@/lib/providers/auth-provider"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { AUTH_MESSAGES } from "@/lib/constants/auth"

export function useSignInMutation() {
  const router = useRouter()
  const { setUser, setError, clearError } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      clearError()
      const result = await signIn.email(data)
      if (result.error) {
        throw new Error(result.error.message)
      }
      return result
    },
    onSuccess: (data) => {
      if (data.data?.user) {
        setUser(data.data.user)
        queryClient.invalidateQueries({ queryKey: ["auth", "session"] })
        toast({
          title: "Success",
          description: AUTH_MESSAGES.SUCCESS.SIGN_IN,
        })
        router.push("/dashboard")
      }
    },
    onError: (error: Error) => {
      setError(error.message)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export function useSignUpMutation() {
  const router = useRouter()
  const { setUser, setError, clearError } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name: string
      email: string
      password: string
      birthday: string
    }) => {
      clearError()
      const result = await signUp.email(data)
      if (result.error) {
        throw new Error(result.error.message)
      }
      return result
    },
    onSuccess: (data) => {
      if (data.data?.user) {
        setUser(data.data.user)
        queryClient.invalidateQueries({ queryKey: ["auth", "session"] })
        toast({
          title: "Success",
          description: AUTH_MESSAGES.SUCCESS.SIGN_UP,
        })
        router.push("/dashboard")
      }
    },
    onError: (error: Error) => {
      setError(error.message)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export function useForgotPasswordMutation() {
  const { setError, clearError } = useAuth()

  return useMutation({
    mutationFn: async (data: { email: string }) => {
      clearError()
      const result = await forgetPassword(data)
      if (result.error) {
        throw new Error(result.error.message)
      }
      return result
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: AUTH_MESSAGES.SUCCESS.PASSWORD_RESET_EMAIL,
      })
    },
    onError: (error: Error) => {
      setError(error.message)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export function useResetPasswordMutation() {
  const router = useRouter()
  const { setError, clearError } = useAuth()

  return useMutation({
    mutationFn: async (data: { password: string; token: string }) => {
      clearError()
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
      toast({
        title: "Success",
        description: AUTH_MESSAGES.SUCCESS.PASSWORD_RESET,
      })
      router.push("/sign-in")
    },
    onError: (error: Error) => {
      setError(error.message)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export function useSignOutMutation() {
  const router = useRouter()
  const { reset } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await signOut()
    },
    onSuccess: () => {
      reset()
      queryClient.clear()
      toast({
        title: "Success",
        description: AUTH_MESSAGES.SUCCESS.SIGN_OUT,
      })
      router.push("/")
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    },
  })
}
