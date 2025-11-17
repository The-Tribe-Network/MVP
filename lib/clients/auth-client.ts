import { createAuthClient } from "better-auth/react"
import { emailOTPClient } from "better-auth/client/plugins"

const { NEXT_PUBLIC_APP_URL, BETTER_AUTH_URL } = process.env;

export const authClient = createAuthClient({
  baseURL: BETTER_AUTH_URL || NEXT_PUBLIC_APP_URL,
  plugins: [
    emailOTPClient()
  ]
})

export const { signIn, signUp, signOut, useSession, getSession, forgetPassword, resetPassword } = authClient
