/**
 * One-time migration script to create tribeSettings rows for existing tribes
 *
 * This script should be run after modifying createTribe() to create settings.
 * It backfills settings for tribes created before this feature was added.
 *
 * Usage:
 *   npx tsx lib/database/migrations/create-missing-tribe-settings.ts
 *
 * Or add to package.json scripts:
 *   "migrate:tribe-settings": "tsx lib/database/migrations/create-missing-tribe-settings.ts"
 */

import { db } from "@/lib/database/client";
import { tribe, tribeSettings } from "@/lib/database/schemas/tribe";
import { eq, notExists, sql } from "drizzle-orm";

async function createMissingTribeSettings() {
  console.log("Starting tribe settings migration...");

  try {
    // Find all tribes that don't have settings
    const tribesWithoutSettings = await db
      .select({ id: tribe.id, name: tribe.name })
      .from(tribe)
      .where(
        notExists(
          db
            .select({ id: tribeSettings.id })
            .from(tribeSettings)
            .where(eq(tribeSettings.tribeId, tribe.id))
        )
      );

    if (tribesWithoutSettings.length === 0) {
      console.log("✅ All tribes already have settings. No migration needed.");
      return;
    }

    console.log(
      `Found ${tribesWithoutSettings.length} tribe(s) without settings:`
    );
    tribesWithoutSettings.forEach((t) => {
      console.log(`  - ${t.name} (${t.id})`);
    });

    // Create settings for each tribe
    console.log("\nCreating default settings...");

    const settingsToInsert = tribesWithoutSettings.map((t) => ({
      tribeId: t.id,
      // All other fields will use schema defaults
    }));

    const created = await db
      .insert(tribeSettings)
      .values(settingsToInsert)
      .returning();

    console.log(
      `✅ Successfully created settings for ${created.length} tribe(s).`
    );

    // Verify all tribes now have settings
    const remaining = await db
      .select({ id: tribe.id })
      .from(tribe)
      .where(
        notExists(
          db
            .select({ id: tribeSettings.id })
            .from(tribeSettings)
            .where(eq(tribeSettings.tribeId, tribe.id))
        )
      );

    if (remaining.length === 0) {
      console.log("✅ Migration completed successfully!");
    } else {
      console.warn(
        `⚠️ Warning: ${remaining.length} tribe(s) still missing settings`
      );
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  createMissingTribeSettings()
    .then(() => {
      console.log("Done!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

export { createMissingTribeSettings };
