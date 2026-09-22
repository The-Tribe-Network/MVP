-- TRI-14 · join by invite link: tribe.invite_code, tribe.invite_code_expires_at
--
-- Hand-written and re-runnable (see tri9-post-payload.sql for why db:migrate is not used). Run:
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri14-invite-code.sql --endpoint <neon-endpoint-id>
--
-- Both columns are nullable with no backfill: a tribe has no code until the first
-- GET /tribes/{id}/invite-link, which generates one. Additive and safe to run before the code.
-- Run it on every database before deploying the code: the invite-link and join routes read both
-- columns.

BEGIN;

-- 10-char Crockford base32 code (DATA-MODEL-DELTA §5). Null until first shared.
ALTER TABLE "tribe" ADD COLUMN IF NOT EXISTS "invite_code" text;

-- Null means the code does not expire; rotation is the only way to retire it.
ALTER TABLE "tribe" ADD COLUMN IF NOT EXISTS "invite_code_expires_at" timestamp;

-- Same name drizzle gives `.unique()` so the schema file and the database agree.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tribe_invite_code_unique'
  ) THEN
    ALTER TABLE "tribe" ADD CONSTRAINT "tribe_invite_code_unique" UNIQUE ("invite_code");
  END IF;
END $$;

COMMIT;

-- Verify:
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'tribe' AND column_name IN ('invite_code', 'invite_code_expires_at');
--   SELECT conname FROM pg_constraint WHERE conname = 'tribe_invite_code_unique';
