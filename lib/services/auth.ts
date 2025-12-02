"use server"
import { auth } from "../clients/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { isProfileComplete } from "./user"
import type { User } from "@/lib/database/types"

/**
 * Get the current session on the server side
 */
export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return session
}

/**
 * Get the current user on the server side
 */
export async function getServerUser(): Promise<User | null> {
  const session = await getServerSession()
  return (session?.user as User | undefined) || null
}

/**
 * Redirect to sign-in if user is not authenticated
 */
export async function requireAuth() {
  const user = await getServerUser()

  if (!user) {
    redirect("/sign-in")
  }

  return user
}

/**
 * Redirect to dashboard if user is already authenticated
 * If user is authenticated but profile is incomplete, redirect to welcome page
 */
export async function redirectIfAuthenticated(route: string = "/dashboard?toast_code=SIGN_IN_SUCCESS") {
  const user = await getServerUser()

  if (user) {
    // Check if profile is complete
    const profileComplete = await isProfileComplete(user.id);

    if (!profileComplete) {
      redirect("/welcome");
    } else {
      redirect(route);
    }
  }
}

/**
 * Check if user is authenticated without redirecting
 */
export async function isAuthenticated() {
  const user = await getServerUser()
  return !!user
}

export async function logout() {
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/sign-in?toast_code=SIGN_OUT_SUCCESS");
};
