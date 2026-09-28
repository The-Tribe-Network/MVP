-- TRI-307 · invite link max uses and a use count (the expiry column exists since TRI-14)
--
-- Hand-written and re-runnable. Purely additive; run it on every database before deploying the code.
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri307-invite-link-limits.sql --endpoint <neon-endpoint-id>

BEGIN;

ALTER TABLE "tribe" ADD COLUMN IF NOT EXISTS "invite_code_max_uses" integer;
ALTER TABLE "tribe" ADD COLUMN IF NOT EXISTS "invite_code_use_count" integer DEFAULT 0 NOT NULL;

COMMIT;

-- Verify:
--   SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns
--   WHERE table_name = 'tribe' AND column_name LIKE 'invite_code%';
