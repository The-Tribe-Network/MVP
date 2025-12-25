/**
 * Seed Data Cleanup
 *
 * Removes all seeded data from the database.
 * Identifies seed data by the @tribe-seed.test email pattern.
 */

import { db } from "@/lib/database/client";
import { user, account } from "@/lib/database/schemas/auth";
import { tribe, tribeMember } from "@/lib/database/schemas/tribe";
import { like, inArray, count, eq } from "drizzle-orm";
import { SEED_EMAIL_DOMAIN, logSuccess, logInfo, logError, REAL_USER_ID } from "./utils";

const SEED_EMAIL_PATTERN = `%${SEED_EMAIL_DOMAIN}`;

/**
 * Check if seed data exists in the database
 */
export async function hasSeedData(): Promise<boolean> {
  const [result] = await db
    .select({ count: count() })
    .from(user)
    .where(like(user.email, SEED_EMAIL_PATTERN));

  return (result?.count || 0) > 0;
}

/**
 * Clean all seeded data from the database
 *
 * Due to foreign key constraints:
 * 1. First, remove real user from seeded tribes (tribeMember)
 * 2. Delete tribes created by seed users (cascades to tribeMember, posts, events, etc.)
 * 3. Delete seed user accounts
 * 4. Delete seed users
 */
export async function cleanSeedData(): Promise<void> {
  console.log("\n\x1b[33m🧹 Cleaning existing seed data...\x1b[0m\n");

  // Step 1: Find all seed users
  const seedUsers = await db
    .select({ id: user.id, email: user.email })
    .from(user)
    .where(like(user.email, SEED_EMAIL_PATTERN));

  if (seedUsers.length === 0) {
    logInfo("No existing seed data found.");
    return;
  }

  const seedUserIds = seedUsers.map((u) => u.id);
  logInfo(`Found ${seedUsers.length} seed users`);

  // Step 2: Find tribes created by seed users
  const seedTribes = await db
    .select({ id: tribe.id, name: tribe.name })
    .from(tribe)
    .where(inArray(tribe.createdBy, seedUserIds));

  if (seedTribes.length > 0) {
    const seedTribeIds = seedTribes.map((t) => t.id);

    // Step 3: Remove real user from seeded tribes (if they were added as admin)
    await db
      .delete(tribeMember)
      .where(
        inArray(tribeMember.tribeId, seedTribeIds)
      );
    logSuccess(`Removed all members from ${seedTribes.length} seeded tribes`);

    // Step 4: Delete the tribes (cascades to posts, events, comments, etc.)
    await db.delete(tribe).where(inArray(tribe.id, seedTribeIds));
    logSuccess(`Deleted ${seedTribes.length} tribes`);
  }

  // Step 5: Delete seed user accounts (credential records)
  await db.delete(account).where(inArray(account.userId, seedUserIds));
  logSuccess(`Deleted ${seedUsers.length} user accounts`);

  // Step 6: Delete seed users
  await db.delete(user).where(inArray(user.id, seedUserIds));
  logSuccess(`Deleted ${seedUsers.length} seed users`);

  console.log("\n\x1b[32m✓ Cleanup complete\x1b[0m\n");
}

/**
 * Get count of seed data entities
 */
export async function getSeedDataStats(): Promise<{
  users: number;
  tribes: number;
}> {
  const [userResult] = await db
    .select({ count: count() })
    .from(user)
    .where(like(user.email, SEED_EMAIL_PATTERN));

  const seedUsers = await db
    .select({ id: user.id })
    .from(user)
    .where(like(user.email, SEED_EMAIL_PATTERN));

  const seedUserIds = seedUsers.map((u) => u.id);

  let tribeCount = 0;
  if (seedUserIds.length > 0) {
    const [tribeResult] = await db
      .select({ count: count() })
      .from(tribe)
      .where(inArray(tribe.createdBy, seedUserIds));
    tribeCount = tribeResult?.count || 0;
  }

  return {
    users: userResult?.count || 0,
    tribes: tribeCount,
  };
}

// Run cleanup if executed directly
if (require.main === module) {
  cleanSeedData()
    .then(() => {
      console.log("Done!");
      process.exit(0);
    })
    .catch((error) => {
      logError(`Fatal error: ${error}`);
      console.error(error);
      process.exit(1);
    });
}
