"use server";

import { db } from "@/lib/database/client";
import { user } from "@/lib/database/schemas/auth";
import { eq, and, ne } from "drizzle-orm";

export interface UpdateProfileInput {
  displayName?: string;
  bio?: string;
  username?: string;
  location?: string;
  avatar?: string;
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, data: UpdateProfileInput) {
  const updateData: Partial<typeof user.$inferInsert> = {};

  if (data.displayName !== undefined) updateData.displayName = data.displayName;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.username !== undefined) updateData.username = data.username.toLowerCase();
  if (data.location !== undefined) updateData.location = data.location;
  // Avatar is handled by the upload endpoint which updates user.image

  const [updatedUser] = await db
    .update(user)
    .set(updateData)
    .where(eq(user.id, userId))
    .returning();

  return updatedUser;
}

/**
 * Check if username is available
 */
export async function checkUsernameAvailability(
  username: string,
  currentUserId?: string
): Promise<boolean> {
  const lowercaseUsername = username.toLowerCase();

  const conditions = currentUserId
    ? and(eq(user.username, lowercaseUsername), ne(user.id, currentUserId))
    : eq(user.username, lowercaseUsername);

  const existingUser = await db
    .select({ id: user.id })
    .from(user)
    .where(conditions)
    .limit(1);

  return existingUser.length === 0;
}

/**
 * Mark profile as complete
 */
export async function markProfileAsComplete(userId: string) {
  await db
    .update(user)
    .set({ profileCompleted: true })
    .where(eq(user.id, userId));
}

/**
 * Check if user profile is complete
 */
export async function isProfileComplete(userId: string): Promise<boolean> {
  const [userData] = await db
    .select({
      profileCompleted: user.profileCompleted,
      displayName: user.displayName,
      username: user.username,
      location: user.location,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userData) return false;

  // Check both the flag and required fields (defense in depth)
  return (
    userData.profileCompleted === true &&
    !!userData.displayName &&
    !!userData.username &&
    !!userData.location
  );
}
