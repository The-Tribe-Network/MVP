-- TRI-317 · per-timeline mute for chat @mention / reply notifications
--
-- Hand-written and re-runnable. Purely additive; run it on every database before deploying the code.
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri317-timeline-mute.sql --endpoint <neon-endpoint-id>
--
-- Needs tri313-timelines.sql. A row means the member muted the timeline.

BEGIN;

CREATE TABLE IF NOT EXISTS "timeline_mute" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "timeline_id" uuid NOT NULL REFERENCES "timeline"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "uq_timeline_mute_timeline_user" UNIQUE ("timeline_id", "user_id")
);

COMMIT;

-- Verify:
--   SELECT to_regclass('public.timeline_mute');
