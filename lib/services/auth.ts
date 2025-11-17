"use server"
import { auth } from "../clients/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

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
export async function getServerUser() {
  const session = await getServerSession()
  return session?.user || null
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
 */
export async function redirectIfAuthenticated(route: string = "/dashboard?toast_code=SIGN_IN_SUCCESS") {
  const user = await getServerUser()

  if (user) {
    redirect(route)
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
