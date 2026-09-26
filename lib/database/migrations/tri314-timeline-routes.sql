-- TRI-314 · timeline routes: canCreateTimelines, timeline_read
--
-- Hand-written and re-runnable. Purely additive; run it on every database before deploying the code (the member
-- permission reads select every column, and the timeline list reads timeline_read).
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri314-timeline-routes.sql --endpoint <neon-endpoint-id>
--
-- Needs tri313-timelines.sql first.

BEGIN;

-- Who may create timelines: role default (owner + admin by system default) and per-member override; null = default
ALTER TABLE "tribe_role_permission" ADD COLUMN IF NOT EXISTS "can_create_timelines" boolean;
ALTER TABLE "tribe_member_permission" ADD COLUMN IF NOT EXISTS "can_create_timelines" boolean;

-- When a member last opened a timeline (switcher unread counts)
CREATE TABLE IF NOT EXISTS "timeline_read" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "timeline_id" uuid NOT NULL REFERENCES "timeline"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "last_read_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "uq_timeline_read_timeline_user" UNIQUE ("timeline_id", "user_id")
);

COMMIT;

-- Verify:
--   SELECT table_name FROM information_schema.columns WHERE column_name = 'can_create_timelines';  -- 2 rows
--   SELECT to_regclass('public.timeline_read');
