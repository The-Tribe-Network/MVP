import { db } from "@/lib/database/client";
import { activity } from "@/lib/database/schemas/activity";
import { user } from "@/lib/database/schemas/auth";
import { tribe } from "@/lib/database/schemas/tribe";
import { post } from "@/lib/database/schemas/post";
import { eq, desc, and, inArray } from "drizzle-orm";
import type { Activity, ActivityInsert, ActivityWithUser } from "@/lib/database/types";

/**
 * Check if a like count is a milestone (1, 5, 10, 15, 20, etc.)
 */
export function isLikeMilestone(count: number): boolean {
  if (count === 1) return true;
  if (count >= 5 && count % 5 === 0) return true;
  return false;
}

/**
 * Create a new activity entry
 */
export async function createActivity(
  data: {
    type: "post" | "photo" | "event" | "member" | "comment" | "like";
    userId: string;
    tribeId?: string;
    postId?: string;
    eventId?: string;
    mediaId?: string;
    targetUserId?: string;
    action: string;
    preview?: string;
  }
): Promise<Activity> {
  const [createdActivity] = await db
    .insert(activity)
    .values({
      type: data.type,
      userId: data.userId,
      tribeId: data.tribeId || null,
      postId: data.postId || null,
      eventId: data.eventId || null,
      mediaId: data.mediaId || null,
      targetUserId: data.targetUserId || null,
      action: data.action,
      preview: data.preview || null,
    } as ActivityInsert)
    .returning();

  return createdActivity;
}

/**
 * Create activity for a new post
 */
export async function createPostActivity(
  postId: string,
  userId: string,
  tribeId: string,
  content: string
): Promise<Activity> {
  const preview = content.length > 100 ? content.substring(0, 100) + "..." : content;

  return createActivity({
    type: "post",
    userId,
    tribeId,
    postId,
    action: "shared a new post",
    preview,
  });
}

/**
 * Create activity for a like milestone
 */
export async function createLikeActivity(
  postId: string,
  userId: string,
  tribeId: string,
  likeCount: number,
  postAuthorId: string
): Promise<Activity> {
  const action = likeCount === 1 
    ? "liked a post"
    : `reached ${likeCount} likes`;

  return createActivity({
    type: "like",
    userId,
    tribeId,
    postId,
    targetUserId: postAuthorId,
    action,
  });
}

/**
 * Check if milestone reached and create activity
 * Only creates activity if it's a new milestone (not duplicate)
 */
export async function checkAndCreateLikeMilestone(
  postId: string,
  likeCount: number,
  userId: string,
  tribeId: string,
  postAuthorId: string
): Promise<Activity | null> {
  // Only create activity if it's a milestone
  if (!isLikeMilestone(likeCount)) {
    return null;
  }

  // Check if activity already exists for this milestone
  // This prevents duplicate activities if multiple likes happen simultaneously
  const existingActivities = await db
    .select()
    .from(activity)
    .where(
      and(
        eq(activity.postId, postId),
        eq(activity.type, "like")
      )
    )
    .limit(10);
  
  // Check if any existing activity has the same milestone action
  const existingActivity = existingActivities.find(a => 
    a.action.includes(`${likeCount} likes`) || 
    (likeCount === 1 && a.action.includes("liked a post"))
  );

  if (existingActivity) {
    // Activity already exists for this milestone
    return null;
  }

  return createLikeActivity(postId, userId, tribeId, likeCount, postAuthorId);
}

/**
 * Get activities for a tribe
 */
export async function getTribeActivities(
  tribeId: string,
  limit: number = 20,
  offset: number = 0
): Promise<ActivityWithUser[]> {
  // Fetch activities with user info
  const activities = await db
    .select({
      id: activity.id,
      type: activity.type,
      userId: activity.userId,
      tribeId: activity.tribeId,
      postId: activity.postId,
      eventId: activity.eventId,
      mediaId: activity.mediaId,
      targetUserId: activity.targetUserId,
      action: activity.action,
      preview: activity.preview,
      createdAt: activity.createdAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      tribe: {
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
      },
    })
    .from(activity)
    .innerJoin(user, eq(activity.userId, user.id))
    .leftJoin(tribe, eq(activity.tribeId, tribe.id))
    .where(eq(activity.tribeId, tribeId))
    .orderBy(desc(activity.createdAt))
    .limit(limit)
    .offset(offset);

  // Transform to ActivityWithUser format
  return activities.map((a) => ({
    id: a.id,
    type: a.type,
    userId: a.userId,
    tribeId: a.tribeId,
    postId: a.postId,
    eventId: a.eventId,
    mediaId: a.mediaId,
    targetUserId: a.targetUserId,
    action: a.action,
    preview: a.preview,
    createdAt: a.createdAt,
    user: a.user,
    tribe: a.tribe || undefined,
  }));
}

/**
 * Get activities from all tribes a user is a member of
 */
export async function getUserTribesActivities(
  tribeIds: string[],
  limit: number = 20,
  offset: number = 0
): Promise<ActivityWithUser[]> {
  if (tribeIds.length === 0) {
    return [];
  }

  // Fetch activities from all user's tribes
  const activities = await db
    .select({
      id: activity.id,
      type: activity.type,
      userId: activity.userId,
      tribeId: activity.tribeId,
      postId: activity.postId,
      eventId: activity.eventId,
      mediaId: activity.mediaId,
      targetUserId: activity.targetUserId,
      action: activity.action,
      preview: activity.preview,
      createdAt: activity.createdAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      tribe: {
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
      },
    })
    .from(activity)
    .innerJoin(user, eq(activity.userId, user.id))
    .leftJoin(tribe, eq(activity.tribeId, tribe.id))
    .where(inArray(activity.tribeId, tribeIds))
    .orderBy(desc(activity.createdAt))
    .limit(limit)
    .offset(offset);

  return activities.map((a) => ({
    id: a.id,
    type: a.type,
    userId: a.userId,
    tribeId: a.tribeId,
    postId: a.postId,
    eventId: a.eventId,
    mediaId: a.mediaId,
    targetUserId: a.targetUserId,
    action: a.action,
    preview: a.preview,
    createdAt: a.createdAt,
    user: a.user,
    tribe: a.tribe || undefined,
  }));
}

/**
 * Get activities for a user (optional, for future use)
 */
export async function getUserActivities(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<ActivityWithUser[]> {
  const activities = await db
    .select({
      id: activity.id,
      type: activity.type,
      userId: activity.userId,
      tribeId: activity.tribeId,
      postId: activity.postId,
      eventId: activity.eventId,
      mediaId: activity.mediaId,
      targetUserId: activity.targetUserId,
      action: activity.action,
      preview: activity.preview,
      createdAt: activity.createdAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      tribe: {
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
      },
    })
    .from(activity)
    .innerJoin(user, eq(activity.userId, user.id))
    .leftJoin(tribe, eq(activity.tribeId, tribe.id))
    .where(eq(activity.userId, userId))
    .orderBy(desc(activity.createdAt))
    .limit(limit)
    .offset(offset);

  return activities.map((a) => ({
    id: a.id,
    type: a.type,
    userId: a.userId,
    tribeId: a.tribeId,
    postId: a.postId,
    eventId: a.eventId,
    mediaId: a.mediaId,
    targetUserId: a.targetUserId,
    action: a.action,
    preview: a.preview,
    createdAt: a.createdAt,
    user: a.user,
    tribe: a.tribe || undefined,
  }));
}

