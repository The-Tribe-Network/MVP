"use server";

import { auth } from "@/lib/clients/auth";
import { headers } from "next/headers";
import { db } from "@/lib/database/client";
import { session } from "@/lib/database/schemas/auth";
import { eq, and, gt } from "drizzle-orm";
import type { SessionWithDevice } from "@/lib/database/types";
import { parseUserAgent, getLocationFromIP } from "@/lib/utils/user-agent";
import { getServerSession } from "./auth";
import { desc } from "drizzle-orm";

/**
 * Change user password using Better Auth
 */
export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await auth.api.changePassword({
      body: {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: data.revokeOtherSessions ?? true,
      },
      headers: await headers(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error changing password:", error);
    return {
      success: false,
      error: error?.message || "Failed to change password. Please check your current password.",
    };
  }
}

/**
 * Get all active sessions for the current user with enriched device information
 */
export async function getUserSessions(): Promise<SessionWithDevice[]> {
  try {
    const currentSession = await getServerSession();
    if (!currentSession?.session?.token) {
      return [];
    }

    const currentSessionToken = currentSession.session.token;
    const userId = currentSession.user.id;

    // Fetch all active sessions for the user from database
    // Sessions are considered active if expiresAt is in the future
    const sessions = await db
      .select()
      .from(session)
      .where(
        and(
          eq(session.userId, userId),
          gt(session.expiresAt, new Date())
        )
      )
      .orderBy(desc(session.updatedAt));

    // Enrich sessions with device information
    const enrichedSessions: SessionWithDevice[] = sessions.map((sess) => {
      const parsed = parseUserAgent(sess.userAgent || null);
      const location = getLocationFromIP(sess.ipAddress || null);
      const isCurrentSession = sess.token === currentSessionToken;

      return {
        ...sess,
        deviceName: parsed.deviceName,
        browser: parsed.browser,
        os: parsed.os,
        location,
        isCurrentSession,
        lastActive: sess.updatedAt || sess.createdAt,
      };
    });

    return enrichedSessions;
  } catch (error) {
    console.error("Error fetching user sessions:", error);
    return [];
  }
}

/**
 * Revoke a specific session by token
 * Deletes the session from the database directly
 */
export async function revokeUserSession(sessionToken: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify the session belongs to the current user
    const currentSession = await getServerSession();
    if (!currentSession?.session?.token) {
      return { success: false, error: "Unauthorized" };
    }

    const currentSessionToken = currentSession.session.token;
    const userId = currentSession.user.id;

    // Cannot revoke current session
    if (sessionToken === currentSessionToken) {
      return { success: false, error: "Cannot revoke current session" };
    }

    // Verify session exists and belongs to user, then delete it
    const [sessionToDelete] = await db
      .select()
      .from(session)
      .where(and(eq(session.token, sessionToken), eq(session.userId, userId)))
      .limit(1);

    if (!sessionToDelete) {
      return { success: false, error: "Session not found or already revoked" };
    }

    // Delete the session
    await db.delete(session).where(eq(session.token, sessionToken));

    return { success: true };
  } catch (error: any) {
    console.error("Error revoking session:", error);
    return {
      success: false,
      error: error?.message || "Failed to revoke session",
    };
  }
}

/**
 * Revoke all other sessions except the current one
 */
export async function revokeOtherSessions(): Promise<{ success: boolean; error?: string }> {
  try {
    await auth.api.revokeOtherSessions({
      headers: await headers(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error revoking other sessions:", error);
    return {
      success: false,
      error: error?.message || "Failed to revoke other sessions",
    };
  }
}

