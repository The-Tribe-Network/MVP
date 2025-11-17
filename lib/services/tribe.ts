"use server";

import { db } from "@/lib/database/client";
import { tribe, tribeMember } from "@/lib/database/schemas/tribe";
import { user } from "@/lib/database/schemas/auth";
import { eq, count } from "drizzle-orm";
import type { TribeWithMembers } from "@/lib/database/types";

/**
 * Get tribe by ID with creator information and member count
 */
export async function getTribeById(id: string): Promise<TribeWithMembers | null> {
  // Fetch tribe
  const [tribeData] = await db
    .select()
    .from(tribe)
    .where(eq(tribe.id, id))
    .limit(1);

  if (!tribeData) {
    return null;
  }

  // Fetch creator
  const [creator] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    })
    .from(user)
    .where(eq(user.id, tribeData.createdBy))
    .limit(1);

  if (!creator) {
    return null;
  }

  // Get member count
  const [memberCountResult] = await db
    .select({ count: count() })
    .from(tribeMember)
    .where(eq(tribeMember.tribeId, id));

  return {
    ...tribeData,
    creator,
    memberCount: memberCountResult?.count || 0,
  };
}

