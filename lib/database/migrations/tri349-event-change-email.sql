-- TRI-349 · outbox for the "event cancelled / moved" email
--
-- Hand-written and re-runnable. Purely additive; run it on every database before deploying the code.
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri349-event-change-email.sql --endpoint <neon-endpoint-id>
--
-- No FK on event_id: a cancelled event can be deleted before its email is sent. One pending row per event.

BEGIN;

CREATE TABLE IF NOT EXISTS "event_change_email" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "event_id" uuid NOT NULL,
  "tribe_id" uuid NOT NULL REFERENCES "tribe"("id") ON DELETE CASCADE,
  "kind" text NOT NULL CHECK ("kind" IN ('cancelled', 'changed')),
  "deleted" boolean DEFAULT false NOT NULL,
  "actor_id" uuid REFERENCES "user"("id") ON DELETE SET NULL,
  "recipient_ids" uuid[] NOT NULL,
  "title" text NOT NULL,
  "before_start" timestamp NOT NULL,
  "before_end" timestamp,
  "before_location" text,
  "after_start" timestamp NOT NULL,
  "after_end" timestamp,
  "after_location" text,
  "send_after" timestamp NOT NULL,
  "sent_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "uq_event_change_email_pending" ON "event_change_email" ("event_id") WHERE "sent_at" IS NULL;
CREATE INDEX IF NOT EXISTS "idx_event_change_email_due" ON "event_change_email" ("send_after") WHERE "sent_at" IS NULL;

COMMIT;

-- Verify:
--   SELECT to_regclass('public.event_change_email');
