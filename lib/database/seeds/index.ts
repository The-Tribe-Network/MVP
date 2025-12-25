/**
 * Database Seed Script
 *
 * Creates mock data for marketing screenshots.
 * Run with: pnpm run seed
 * Force reseed: pnpm run seed:force
 */

import { greekLifeData } from "./data/greek-life";
import { diasporaData } from "./data/diaspora";
import { fitnessData } from "./data/fitness";
import { hospitalityData } from "./data/hospitality";
import { seedUsers } from "./seed-users";
import { seedTribe } from "./seed-tribes";
import { seedPosts } from "./seed-posts";
import { seedComments } from "./seed-comments";
import { seedEvents } from "./seed-events";
import { cleanSeedData, hasSeedData } from "./clean";
import { logStart, logComplete, logTribe, logError, logInfo } from "./utils";

// All tribe data to seed
const ALL_TRIBE_DATA = [greekLifeData, diasporaData, fitnessData, hospitalityData];

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

  // Seed each tribe
  for (const tribeData of ALL_TRIBE_DATA) {
    logTribe(tribeData.tribe.name);

    try {
      // 1. Create users
      const emailToIdMap = await seedUsers(tribeData.users, avatarOffset);
      avatarOffset += tribeData.users.length;

      // 2. Create tribe with members
      const tribeId = await seedTribe(tribeData, emailToIdMap);

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

      // 5. Create events with attendees
      await seedEvents(tribeId, tribeData.events, tribeData.users, emailToIdMap);
    } catch (error) {
      logError(`Failed to seed tribe "${tribeData.tribe.name}"`);
      throw error;
    }
  }

  logComplete();

  // Print summary
  const totalUsers = ALL_TRIBE_DATA.reduce((sum, t) => sum + t.users.length, 0);
  const totalPosts = ALL_TRIBE_DATA.reduce((sum, t) => sum + t.posts.length, 0);
  const totalEvents = ALL_TRIBE_DATA.reduce((sum, t) => sum + t.events.length, 0);

  console.log("Summary:");
  console.log(`  - ${ALL_TRIBE_DATA.length} tribes created`);
  console.log(`  - ${totalUsers} seed users created`);
  console.log(`  - ${totalPosts} posts created`);
  console.log(`  - ${totalEvents} events created`);
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
