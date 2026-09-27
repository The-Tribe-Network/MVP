-- TRI-344 · email opt-outs for the alpha emails (event updates, daily digest)
--
-- Hand-written and re-runnable. Purely additive; run it on every database before deploying the code.
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri344-email-preferences.sql --endpoint <neon-endpoint-id>
--
-- No row = every category on, so nothing is backfilled.

BEGIN;

CREATE TABLE IF NOT EXISTS "user_email_preference" (
  "user_id" uuid PRIMARY KEY NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "event_updates" boolean DEFAULT true NOT NULL,
  "digest" boolean DEFAULT true NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

COMMIT;

-- Verify:
--   SELECT to_regclass('public.user_email_preference');
