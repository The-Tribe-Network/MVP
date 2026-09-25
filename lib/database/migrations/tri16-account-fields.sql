-- TRI-16 · account fields (phone, language, timezone, birthday) and delete-account tombstones
--
-- Hand-written and re-runnable, like tri15-member-profile.sql: the drizzle journal is behind the real
-- databases, so `db:migrate` cannot apply this. Run it directly:
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri16-account-fields.sql --endpoint <neon-endpoint-id>
--
-- Purely additive (five nullable/defaulted columns, one partial index, no backfill). Run it on every
-- database before deploying the code: Better-Auth reads and writes these columns on sign-up and every session.
--
-- deleted_at marks a tombstone left by DELETE /me/account: the row stays so the user's posts, comments and
-- events (whose FKs cascade on user delete) survive, attributed to "Deleted user"; PII is scrubbed.

BEGIN;

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "phone" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "language" text DEFAULT 'en';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "timezone" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "birthday" date;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;

-- Existing rows get the default too (ADD COLUMN ... DEFAULT fills them; this covers a column added without one)
UPDATE "user" SET "language" = 'en' WHERE "language" IS NULL;

-- Tombstones are few; lets "live users only" filters skip them cheaply
CREATE INDEX IF NOT EXISTS "idx_user_deleted_at" ON "user" ("deleted_at") WHERE "deleted_at" IS NOT NULL;

COMMIT;

-- Verify:
--   SELECT column_name, data_type, column_default FROM information_schema.columns
--   WHERE table_name = 'user' AND column_name IN ('phone', 'language', 'timezone', 'birthday', 'deleted_at');
