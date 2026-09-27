-- TRI-332 · per-item read for HOME-03 Catch up
--
-- Hand-written and re-runnable. Purely additive; run it on every database before deploying the code.
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri332-catch-up-read.sql --endpoint <neon-endpoint-id>
--
-- A row means the member opened that Catch up item (`item_id` is the CatchUpItem id, e.g. `post:<uuid>`).

BEGIN;

CREATE TABLE IF NOT EXISTS "catch_up_read" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "tribe_id" uuid NOT NULL REFERENCES "tribe"("id") ON DELETE CASCADE,
  "item_id" text NOT NULL,
  "read_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "uq_catch_up_read_user_item" UNIQUE ("user_id", "item_id")
);

COMMIT;

-- Verify:
--   SELECT to_regclass('public.catch_up_read');
