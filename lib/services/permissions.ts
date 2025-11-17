import { db } from "@/lib/database/client";
import { tribeMember } from "@/lib/database/schemas/tribe";
import { eq, and } from "drizzle-orm";

/**
 * Check if a user is a member of a tribe
 */
export async function checkTribeMembership(
  tribeId: string,
  userId: string
): Promise<boolean> {
  const member = await db
    .select()
    .from(tribeMember)
    .where(and(eq(tribeMember.tribeId, tribeId), eq(tribeMember.userId, userId)))
    .limit(1);

  return member.length > 0;
}

/**
 * Get user's role in a tribe
 */
export async function getUserTribeRole(
  tribeId: string,
  userId: string
): Promise<string | null> {
  const member = await db
    .select({ role: tribeMember.role })
    .from(tribeMember)
    .where(and(eq(tribeMember.tribeId, tribeId), eq(tribeMember.userId, userId)))
    .limit(1);

  return member[0]?.role || null;
}

