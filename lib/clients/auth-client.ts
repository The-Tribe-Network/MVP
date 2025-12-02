import { createAuthClient } from "better-auth/react"
import { emailOTPClient, inferAdditionalFields } from "better-auth/client/plugins"
import { auth } from "./auth";

const { NEXT_PUBLIC_APP_URL, BETTER_AUTH_URL } = process.env;

export const authClient = createAuthClient({
  baseURL: BETTER_AUTH_URL || NEXT_PUBLIC_APP_URL,
  plugins: [
    emailOTPClient(),
    inferAdditionalFields<typeof auth>()
  ]
})

export const { signIn, signUp, signOut, useSession, getSession, forgetPassword, resetPassword } = authClient
