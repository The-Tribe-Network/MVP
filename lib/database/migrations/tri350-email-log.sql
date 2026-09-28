-- TRI-350 · "send at most once" ledger for emails (first user: the day-before event reminder)
--
-- Hand-written and re-runnable. Purely additive; run it on every database before deploying the code.
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri350-email-log.sql --endpoint <neon-endpoint-id>

BEGIN;

CREATE TABLE IF NOT EXISTS "email_log" (
  "user_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "key" text NOT NULL,
  "sent_at" timestamp DEFAULT now() NOT NULL,
  PRIMARY KEY ("user_id", "key")
);

COMMIT;

-- Verify:
--   SELECT to_regclass('public.email_log');
