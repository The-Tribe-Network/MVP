import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(DATABASE_URL);

async function runMigration() {
  try {
    console.log("Running migration: Migrate autoAddPostMediaToTribe from user to tribe_member_preference...\n");

    // Step 1: Check how many users have tribe memberships
    console.log("Step 1: Checking users with tribe memberships...");
    const userCountResult = await sql`
      SELECT COUNT(DISTINCT u.id) as user_count
      FROM "user" u
      INNER JOIN tribe_member tm ON tm.user_id = u.id
    `;
    const userCount = userCountResult[0]?.user_count || 0;
    console.log(`Found ${userCount} users with tribe memberships\n`);

    // Step 2: Check how many tribe members exist
    const memberCountResult = await sql`
      SELECT COUNT(*) as member_count
      FROM tribe_member
    `;
    const memberCount = memberCountResult[0]?.member_count || 0;
    console.log(`Found ${memberCount} total tribe memberships\n`);

    // Step 3: Migrate data from user table to tribe_member_preference
    // This will create a preference record for each tribe member using the user's current setting
    console.log("Step 2: Migrating user preferences to tribe member preferences...");
    const result = await sql`
      INSERT INTO tribe_member_preference (
        tribe_member_id,
        user_id,
        auto_add_post_media_to_tribe,
        created_at,
        updated_at
      )
      SELECT 
        tm.id as tribe_member_id,
        tm.user_id,
        COALESCE(u.auto_add_post_media_to_tribe, true) as auto_add_post_media_to_tribe,
        NOW() as created_at,
        NOW() as updated_at
      FROM tribe_member tm
      INNER JOIN "user" u ON u.id = tm.user_id
      WHERE NOT EXISTS (
        SELECT 1 
        FROM tribe_member_preference tmp 
        WHERE tmp.tribe_member_id = tm.id
      )
    `;
    console.log("✅ Preferences migrated successfully\n");

    // Step 4: Verify the migration
    console.log("Step 3: Verifying migration...");
    const verifyResult = await sql`
      SELECT COUNT(*) as preference_count
      FROM tribe_member_preference
    `;
    const preferenceCount = verifyResult[0]?.preference_count || 0;
    console.log(`Created ${preferenceCount} tribe member preference records\n`);

    // Step 5: Show summary
    console.log("📊 Migration Summary:");
    console.log(`   - Users with tribe memberships: ${userCount}`);
    console.log(`   - Total tribe memberships: ${memberCount}`);
    console.log(`   - Preference records created: ${preferenceCount}`);

    if (preferenceCount < memberCount) {
      console.log(`\n   ⚠️  Note: Some preferences may have already existed (${memberCount - preferenceCount} skipped)`);
    }

    console.log("\n🎉 Migration completed successfully!");
    console.log("\n⚠️  Next steps:");
    console.log("   1. Test the application to ensure preferences work correctly");
    console.log("   2. Once verified, you can remove the 'auto_add_post_media_to_tribe' column from the 'user' table");
  } catch (error: any) {
    console.error("❌ Migration failed:", error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    process.exit(1);
  }
}

runMigration();

