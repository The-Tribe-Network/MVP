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
    console.log("Running migration: Convert tribe.avatar from TEXT to UUID...\n");
    
    // Step 1: Clean up any invalid UUID values
    console.log("Step 1: Cleaning up invalid UUID values...");
    await sql`
      UPDATE tribe 
      SET avatar = NULL 
      WHERE avatar IS NOT NULL 
        AND avatar !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    `;
    console.log("✅ Cleaned up invalid UUID values\n");
    
    // Step 2: Convert the column type from TEXT to UUID
    console.log("Step 2: Converting avatar column from TEXT to UUID...");
    await sql`ALTER TABLE tribe ALTER COLUMN avatar TYPE uuid USING avatar::uuid`;
    console.log("✅ Column type converted\n");
    
    // Step 3: Add foreign key constraint (if it doesn't already exist)
    console.log("Step 3: Adding foreign key constraint...");
    try {
      await sql`
        ALTER TABLE tribe 
        ADD CONSTRAINT tribe_avatar_fkey 
        FOREIGN KEY (avatar) REFERENCES media(id) ON DELETE SET NULL
      `;
      console.log("✅ Foreign key constraint added\n");
    } catch (error: any) {
      if (error.code === '42P07' || error.message?.includes('already exists')) {
        console.log("ℹ️  Foreign key constraint already exists, skipping...\n");
      } else {
        throw error;
      }
    }
    
    console.log("🎉 Migration completed successfully!");
  } catch (error: any) {
    console.error("❌ Migration failed:", error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    process.exit(1);
  }
}

runMigration();

