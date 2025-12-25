/**
 * Seed Users
 *
 * Creates users with properly hashed passwords using Better-Auth's scrypt.
 * Returns a map of email -> userId for reference by other seeders.
 */

import { db } from "@/lib/database/client";
import { user, account } from "@/lib/database/schemas/auth";
import type { SeedUserData } from "./types";
import {
  getAvatarUrl,
  hashSeedPassword,
  SEED_PASSWORD,
  logSuccess,
} from "./utils";

/**
 * Create seed users in the database
 *
 * @param users - Array of seed user data
 * @param avatarOffset - Offset for avatar indices (to avoid duplicates across tribes)
 * @returns Map of email -> userId
 */
export async function seedUsers(
  users: SeedUserData[],
  avatarOffset: number = 0
): Promise<Map<string, string>> {
  const emailToIdMap = new Map<string, string>();

  // Hash password once (same for all seed users)
  const hashedPassword = await hashSeedPassword(SEED_PASSWORD);

  for (let i = 0; i < users.length; i++) {
    const userData = users[i];
    const avatarUrl = getAvatarUrl(userData.avatarGender, avatarOffset + i);

    // Create user
    const [createdUser] = await db
      .insert(user)
      .values({
        name: userData.name,
        email: userData.email,
        emailVerified: true, // Skip verification for seed users
        image: avatarUrl,
        profileCompleted: true,
        tourCompleted: true,
      })
      .returning();

    // Create credential account with hashed password
    await db.insert(account).values({
      accountId: createdUser.id, // Use user ID as account ID for credential accounts
      providerId: "credential",
      userId: createdUser.id,
      password: hashedPassword,
    });

    emailToIdMap.set(userData.email, createdUser.id);
  }

  logSuccess(`Created ${users.length} users`);
  return emailToIdMap;
}

/**
 * Get user IDs by their index in the original users array
 *
 * @param users - Array of seed user data
 * @param emailToIdMap - Map of email -> userId
 * @returns Array of user IDs in the same order as the input
 */
export function getUserIdsByIndex(
  users: SeedUserData[],
  emailToIdMap: Map<string, string>
): string[] {
  return users.map((u) => {
    const userId = emailToIdMap.get(u.email);
    if (!userId) {
      throw new Error(`User ID not found for email: ${u.email}`);
    }
    return userId;
  });
}
