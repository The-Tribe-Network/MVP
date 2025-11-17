import { db } from "@/lib/database/client";
import { tribe, tribeMember } from "@/lib/database/schemas/tribe";
import { user } from "@/lib/database/schemas/auth";
import { eq, count } from "drizzle-orm";
import type { TribeInsert, TribeWithCreator, TribeWithMembers, Tribe } from "@/lib/database/types";

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
    invitations?: Array<{ email: string; role: "admin" | "moderator" | "member" }>;
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
    } as any)
    .returning();

  // Add creator as owner
  await db.insert(tribeMember)
    .values({
      tribeId: createdTribe.id,
      userId: userId,
      role: "owner",
    } as any);

  // Fetch creator info
  const [creator] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  // Create invitations if provided
  // Wrap in try-catch to ensure tribe creation succeeds even if invitations fail
  if (data.invitations && data.invitations.length > 0) {
    try {
      const { createTribeInvitations } = await import("./invitation");
      await createTribeInvitations(
        createdTribe.id,
        createdTribe.name,
        data.invitations,
        userId,
        creator?.name || "Someone"
      );
    } catch (error) {
      // Log error but don't fail tribe creation
      console.error("Failed to create invitations (tribe was still created):", error);
    }
  }

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

/**
 * Get all tribes a user is a member of
 * Returns basic tribe information (id, name, avatar) for sidebar display
 */
export async function getUserTribes(userId: string): Promise<Array<{ id: string; name: string; avatar: string | null }>> {
  const userTribes = await db
    .select({
      id: tribe.id,
      name: tribe.name,
      avatar: tribe.avatar,
    })
    .from(tribeMember)
    .innerJoin(tribe, eq(tribeMember.tribeId, tribe.id))
    .where(eq(tribeMember.userId, userId));

  return userTribes;
}

