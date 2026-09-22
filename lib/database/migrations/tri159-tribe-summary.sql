-- TRI-159 · tribe list summary: tribe.color, tribe_member_preference.last_catch_up_at
--
-- Hand-written and re-runnable (see tri9-post-payload.sql for why db:migrate is not used). Run:
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri159-tribe-summary.sql --endpoint <neon-endpoint-id>
--
-- Both columns are nullable with no backfill, so this is additive and safe to run before the code.
-- Run it on every database before deploying the code: the tribe list selects both columns.

BEGIN;

-- Optional brand colour for HOME-02 calendar dots. Null means the client hashes the tribe id.
ALTER TABLE "tribe" ADD COLUMN IF NOT EXISTS "color" text;

-- When the member last finished HOME-03 catch-up. TribeSummary.unreadCount counts posts since then.
-- Written by the catch-up endpoint (TRI-6); until that ships every row stays null.
ALTER TABLE "tribe_member_preference" ADD COLUMN IF NOT EXISTS "last_catch_up_at" timestamp;

COMMIT;

-- Verify:
--   SELECT column_name FROM information_schema.columns
--   WHERE (table_name = 'tribe' AND column_name = 'color')
--      OR (table_name = 'tribe_member_preference' AND column_name = 'last_catch_up_at');
