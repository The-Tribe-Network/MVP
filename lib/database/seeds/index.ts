/**
 * Database Seed Script
 *
 * Creates mock data for marketing screenshots.
 * Run with: pnpm run seed
 * Force reseed: pnpm run seed:force
 */

import { db } from "@/lib/database/client";
import { tribe, tribeMember } from "@/lib/database/schemas/tribe";
import { eq } from "drizzle-orm";
import { HOME_DASHBOARD_DATA, CROSS_TRIBE_MEMBERS } from "./data/home-dashboard";
import { seedUsers } from "./seed-users";
import { seedTribe } from "./seed-tribes";
import { seedPosts } from "./seed-posts";
import { seedComments } from "./seed-comments";
import { seedPostLikes } from "./seed-likes";
import { seedEvents } from "./seed-events";
import { cleanSeedData, hasSeedData } from "./clean";
import { logStart, logComplete, logTribe, logError, logInfo, logSuccess } from "./utils";

// All tribe data to seed (using home dashboard data)
const ALL_TRIBE_DATA = HOME_DASHBOARD_DATA;

/**
 * Main seeding function
 */
async function seedDatabase(options: { force?: boolean } = {}): Promise<void> {
  logStart();

  // Check for existing seed data
  const hasExisting = await hasSeedData();

  if (hasExisting && !options.force) {
    logInfo("Seed data already exists. Use --force to delete and reseed.");
    logInfo("Run: pnpm run seed:force");
    return;
  }

  if (hasExisting && options.force) {
    await cleanSeedData();
  }

  // Track avatar offset to avoid duplicate avatars across tribes
  let avatarOffset = 0;

  // Store tribe name -> id mapping for cross-tribe members
  const tribeNameToIdMap = new Map<string, string>();

  // Store all email -> id mappings across tribes
  const globalEmailToIdMap = new Map<string, string>();

  // Seed each tribe
  for (const tribeData of ALL_TRIBE_DATA) {
    logTribe(tribeData.tribe.name);

    try {
      // 1. Create users
      const emailToIdMap = await seedUsers(tribeData.users, avatarOffset);
      avatarOffset += tribeData.users.length;

      // Merge into global map
      emailToIdMap.forEach((id, email) => {
        globalEmailToIdMap.set(email, id);
      });

      // 2. Create tribe with members
      const tribeId = await seedTribe(tribeData, emailToIdMap);
      tribeNameToIdMap.set(tribeData.tribe.name, tribeId);

      // 3. Create posts
      const postIndexToIdMap = await seedPosts(
        tribeId,
        tribeData.posts,
        tribeData.users,
        emailToIdMap
      );

      // 4. Create comments
      await seedComments(
        tribeData.posts,
        postIndexToIdMap,
        tribeData.users,
        emailToIdMap
      );

      // 5. Create post likes
      await seedPostLikes(
        tribeData.posts,
        postIndexToIdMap,
        tribeData.users,
        emailToIdMap
      );

      // 6. Create events with attendees
      await seedEvents(tribeId, tribeData.events, tribeData.users, emailToIdMap);
    } catch (error) {
      logError(`Failed to seed tribe "${tribeData.tribe.name}"`);
      throw error;
    }
  }

  // Handle cross-tribe memberships
  for (const crossMember of CROSS_TRIBE_MEMBERS) {
    const userId = globalEmailToIdMap.get(crossMember.userEmail);
    const tribeId = tribeNameToIdMap.get(crossMember.tribeName);

    if (userId && tribeId) {
      await db.insert(tribeMember).values({
        tribeId,
        userId,
        role: crossMember.role,
      });
      logSuccess(`Added cross-tribe member to "${crossMember.tribeName}"`);
    }
  }

  logComplete();

  // Print summary
  const totalUsers = ALL_TRIBE_DATA.reduce((sum, t) => sum + t.users.length, 0);
  const totalPosts = ALL_TRIBE_DATA.reduce((sum, t) => sum + t.posts.length, 0);
  const totalComments = ALL_TRIBE_DATA.reduce(
    (sum, t) => sum + t.posts.reduce((pSum, p) => pSum + (p.comments?.length || 0), 0),
    0
  );
  const totalLikes = ALL_TRIBE_DATA.reduce(
    (sum, t) => sum + t.posts.reduce((pSum, p) => pSum + (p.likerIndices?.length || 0), 0),
    0
  );
  const totalEvents = ALL_TRIBE_DATA.reduce((sum, t) => sum + t.events.length, 0);

  console.log("Summary:");
  console.log(`  - ${ALL_TRIBE_DATA.length} tribes created`);
  console.log(`  - ${totalUsers} seed users created`);
  console.log(`  - ${totalPosts} posts created`);
  console.log(`  - ${totalComments} comments created`);
  console.log(`  - ${totalLikes} post likes created`);
  console.log(`  - ${totalEvents} events created`);
  console.log(`  - ${CROSS_TRIBE_MEMBERS.length} cross-tribe memberships created`);
  console.log(`  - Your account added as admin to all tribes\n`);
}

// Parse CLI arguments and run
if (require.main === module) {
  const force = process.argv.includes("--force");

  seedDatabase({ force })
    .then(() => {
      console.log("Done!");
      process.exit(0);
    })
    .catch((error) => {
      logError(`Fatal error: ${error.message}`);
      console.error(error);
      process.exit(1);
    });
}

export { seedDatabase };
