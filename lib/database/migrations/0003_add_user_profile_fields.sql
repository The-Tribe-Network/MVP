-- Add new profile fields to user table
ALTER TABLE "user" ADD COLUMN "display_name" text;
ALTER TABLE "user" ADD COLUMN "bio" text;
ALTER TABLE "user" ADD COLUMN "location" text;
ALTER TABLE "user" ADD COLUMN "profile_completed" boolean DEFAULT false NOT NULL;

-- Mark existing users as complete to avoid forcing them through setup
UPDATE "user" SET "profile_completed" = true WHERE "created_at" < NOW();
