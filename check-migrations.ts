import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(DATABASE_URL);

async function checkMigrations() {
  console.log("Checking migration status...\n");

  try {
    // Check 0001: Convert avatar to UUID
    console.log("✓ Checking 0001_convert_avatar_to_uuid.sql");
    const avatarType = await sql`
      SELECT data_type
      FROM information_schema.columns
      WHERE table_name = 'tribe'
      AND column_name = 'avatar'
    `;
    const avatarApplied = avatarType[0]?.data_type === 'uuid';
    console.log(`  Avatar column type: ${avatarType[0]?.data_type || 'NOT FOUND'}`);
    console.log(`  Status: ${avatarApplied ? '✅ APPLIED' : '❌ NOT APPLIED'}\n`);

    // Check 0002: Performance indexes
    console.log("✓ Checking 0002_add_performance_indexes.sql");
    const indexes = await sql`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND indexname IN (
        'idx_post_tribe_created_at',
        'idx_comment_post_created_at',
        'idx_media_tribe_created_at',
        'idx_activity_tribe_created_at'
      )
    `;
    console.log(`  Found ${indexes.length}/4 expected performance indexes`);
    console.log(`  Status: ${indexes.length === 4 ? '✅ APPLIED' : '⚠️ PARTIALLY APPLIED'}\n`);

    // Check 0003: User profile fields
    console.log("✓ Checking 0003_add_user_profile_fields.sql");
    const userColumns = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'user'
      AND column_name IN ('bio', 'location', 'website', 'phone_number')
    `;
    console.log(`  Found ${userColumns.length}/4 expected user profile columns`);
    console.log(`  Status: ${userColumns.length === 4 ? '✅ APPLIED' : '❌ NOT APPLIED'}\n`);

    // Check 0004: Album many-to-many
    console.log("✓ Checking 0004_album_many_to_many.sql");

    // Check if album_media table exists
    const albumMediaTable = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'album_media'
      ) as exists
    `;
    const albumMediaExists = albumMediaTable[0]?.exists;

    // Check if deprecated columns still exist
    const albumIdExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'media'
        AND column_name = 'album_id'
      ) as exists
    `;
    const coverImageUrlExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'album'
        AND column_name = 'cover_image_url'
      ) as exists
    `;

    console.log(`  album_media table: ${albumMediaExists ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  media.album_id (deprecated): ${albumIdExists[0]?.exists ? '❌ STILL EXISTS' : '✅ REMOVED'}`);
    console.log(`  album.cover_image_url (deprecated): ${coverImageUrlExists[0]?.exists ? '❌ STILL EXISTS' : '✅ REMOVED'}`);

    const migration0004Applied = albumMediaExists && !albumIdExists[0]?.exists && !coverImageUrlExists[0]?.exists;
    console.log(`  Status: ${migration0004Applied ? '✅ APPLIED' : '❌ NOT APPLIED'}\n`);

    // Summary
    console.log("=" + "=".repeat(50));
    console.log("SUMMARY:");
    console.log("=" + "=".repeat(50));
    console.log(`0001_convert_avatar_to_uuid.sql: ${avatarApplied ? '✅' : '❌'}`);
    console.log(`0002_add_performance_indexes.sql: ${indexes.length === 4 ? '✅' : '⚠️'}`);
    console.log(`0003_add_user_profile_fields.sql: ${userColumns.length === 4 ? '✅' : '❌'}`);
    console.log(`0004_album_many_to_many.sql: ${migration0004Applied ? '✅' : '❌'}`);
    console.log("=" + "=".repeat(50));

  } catch (error: any) {
    console.error("❌ Error checking migrations:", error.message);
    process.exit(1);
  }
}

checkMigrations();
