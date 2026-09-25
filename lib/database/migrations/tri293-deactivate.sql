-- TRI-293 · deactivate account
--
-- Hand-written and re-runnable, like tri16-account-fields.sql (the drizzle journal is behind the real databases).
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri293-deactivate.sql --endpoint <neon-endpoint-id>
--
-- Purely additive (one nullable column, one partial index, no backfill). Run it on every database before
-- deploying the code: the session-create hook reads the column on every sign-in.
--
-- deactivated_at is set by POST /me/account/deactivate and cleared when the user signs in again.

BEGIN;

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "deactivated_at" timestamp;

-- Deactivated accounts are few; lets "active users only" filters skip them cheaply
CREATE INDEX IF NOT EXISTS "idx_user_deactivated_at" ON "user" ("deactivated_at") WHERE "deactivated_at" IS NOT NULL;

COMMIT;

-- Verify:
--   SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'deactivated_at';
--   SELECT indexname FROM pg_indexes WHERE tablename = 'user' AND indexname = 'idx_user_deactivated_at';
