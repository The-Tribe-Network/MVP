import { db } from "@/lib/database/client";
import { tribe, tribeMember } from "@/lib/database/schemas/tribe";
import { user } from "@/lib/database/schemas/auth";
import { eq, count, desc } from "drizzle-orm";
import type { TribeInsert, TribeWithCreator, TribeWithMembers } from "@/lib/database/types";

/**
 * Create a new tribe and add the creator as owner
 */
export async function createTribe(
  data: {
    name: string;
    description?: string;
    avatar?: string;
    location?: string;
    privacy?: "private" | "public";
    category?: "social" | "gaming" | "family" | "work" | "hobbies" | "other";
  },
  userId: string
): Promise<TribeWithCreator> {
  // Insert tribe
  const [createdTribe] = await db
    .insert(tribe)
    .values({
      name: data.name,
      description: data.description || null,
      avatar: data.avatar || null,
      location: data.location || null,
      privacy: data.privacy || "private",
      category: data.category || "other",
      createdBy: userId,
    })
    .returning();

  // Add creator as owner
  await db.insert(tribeMember).values({
    tribeId: createdTribe.id,
    userId: userId,
    role: "owner",
  });

  // Fetch creator info
  const [creator] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return {
    ...createdTribe,
    creator: creator!,
  };
}

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
    .select()
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

