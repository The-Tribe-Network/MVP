import { db, getDbTransaction } from "@/lib/database/client";
import { tribe, tribeMember } from "@/lib/database/schemas/tribe";
import { user } from "@/lib/database/schemas/auth";
import { media } from "@/lib/database/schemas/media";
import { eq, count, and } from "drizzle-orm";
import type { TribeInsert, TribeWithCreator, TribeWithMembers, Tribe } from "@/lib/database/types";

/**
 * Create a new tribe and add the creator as owner
 * OPTIMIZED: Wrapped in transaction to ensure tribe + owner are created atomically
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
  const dbTx = getDbTransaction();

  // Create tribe and add creator as owner in a transaction
  const createdTribe = await dbTx.transaction(async (tx) => {
    // Insert tribe
    const [newTribe] = await tx
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
    await tx.insert(tribeMember).values({
      tribeId: newTribe.id,
      userId: userId,
      role: "owner",
    } as any);

    return newTribe;
  });

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
 * OPTIMIZED: 2 DB calls instead of 3 (tribe+creator join, then member count in parallel)
 * Resolves avatar ID to URL if avatar exists
 */
export async function getTribeById(id: string, includeAvatar: boolean = false): Promise<TribeWithMembers | null> {
  // Fetch tribe with avatar URL and creator in a single query with joins
  const [tribeData] = await db
    .select({
      id: tribe.id,
      name: tribe.name,
      description: tribe.description,
      avatar: tribe.avatar,
      location: tribe.location,
      privacy: tribe.privacy,
      category: tribe.category,
      isFeatured: tribe.isFeatured,
      isTrending: tribe.isTrending,
      createdBy: tribe.createdBy,
      createdAt: tribe.createdAt,
      updatedAt: tribe.updatedAt,
      avatarUrl: media.fileUrl,
      creator: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        displayName: user.displayName,
        bio: user.bio,
        location: user.location,
        profileCompleted: user.profileCompleted,
      },
    })
    .from(tribe)
    .leftJoin(media, eq(tribe.avatar, media.id))
    .innerJoin(user, eq(tribe.createdBy, user.id))
    .where(eq(tribe.id, id))
    .limit(1);

  if (!tribeData) {
    return null;
  }

  // Get member count (single query)
  const [memberCountResult] = await db
    .select({ count: count() })
    .from(tribeMember)
    .where(eq(tribeMember.tribeId, id));

  // Replace avatar ID with URL if available
  const { avatarUrl, creator, ...tribeFields } = tribeData;

  return {
    ...tribeFields,
    avatar: avatarUrl || tribeData.avatar, // Use URL if available, otherwise keep original (null or ID)
    creator,
    memberCount: memberCountResult?.count || 0,
  };
}

/**
 * Get all tribes a user is a member of
 * Returns basic tribe information (id, name, avatar) for sidebar display
 * Resolves avatar ID to URL if avatar exists
 */
export async function getUserTribes(userId: string): Promise<Array<{ id: string; name: string; avatar: string | null }>> {
  const userTribes = await db
    .select({
      id: tribe.id,
      name: tribe.name,
      avatar: tribe.avatar,
      avatarUrl: media.fileUrl,
    })
    .from(tribeMember)
    .innerJoin(tribe, eq(tribeMember.tribeId, tribe.id))
    .leftJoin(media, eq(tribe.avatar, media.id))
    .where(eq(tribeMember.userId, userId));

  // Replace avatar ID with URL if available
  return userTribes.map(({ avatarUrl, avatar, ...rest }) => ({
    ...rest,
    avatar: avatarUrl || avatar, // Use URL if available, otherwise keep original (null or ID)
  }));
}

/**
 * Remove a user from a tribe (leave tribe)
 * Returns success/error response
 * Prevents owners from leaving without transferring ownership
 */
export async function leaveTribe(
  tribeId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  // Check if user is a member
  const [member] = await db
    .select({ role: tribeMember.role })
    .from(tribeMember)
    .where(and(eq(tribeMember.tribeId, tribeId), eq(tribeMember.userId, userId)))
    .limit(1);

  if (!member) {
    return { success: false, error: "You are not a member of this tribe" };
  }

  // Prevent owners from leaving
  if (member.role === "owner") {
    return {
      success: false,
      error: "Tribe owners cannot leave. Please transfer ownership first.",
    };
  }

  // Delete the member record
  await db
    .delete(tribeMember)
    .where(and(eq(tribeMember.tribeId, tribeId), eq(tribeMember.userId, userId)));

  return { success: true };
}

