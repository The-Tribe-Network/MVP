-- TRI-313 · timelines: the timeline table, a Global timeline per tribe, post.timeline_id, the member's selection
--
-- Hand-written and re-runnable (the drizzle journal is behind the real databases). Two files, in order:
--
--   1. this file, BEFORE deploying the code: additive only. post.timeline_id stays nullable so the code that is
--      still running (which doesn't set it) keeps working.
--   2. tri313b-post-timeline-not-null.sql, AFTER the code is deployed: backfills anything written in between and
--      sets post.timeline_id NOT NULL.
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri313-timelines.sql --endpoint <neon-endpoint-id>

BEGIN;

DO $$ BEGIN
  CREATE TYPE "timeline_type" AS ENUM ('posts', 'chat');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "timeline_post_permission" AS ENUM ('everyone', 'admins');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "timeline" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tribe_id" uuid NOT NULL REFERENCES "tribe"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "emoji" text,
  "type" "timeline_type" DEFAULT 'posts' NOT NULL,
  "is_global" boolean DEFAULT false NOT NULL,
  "post_permission" "timeline_post_permission" DEFAULT 'everyone' NOT NULL,
  "position" integer DEFAULT 0 NOT NULL,
  "created_by" uuid REFERENCES "user"("id") ON DELETE SET NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_timeline_tribe_position" ON "timeline" ("tribe_id", "position");
-- Exactly one Global per tribe
CREATE UNIQUE INDEX IF NOT EXISTS "uq_timeline_global_per_tribe" ON "timeline" ("tribe_id") WHERE "is_global";

-- A Global timeline for every tribe that doesn't have one
INSERT INTO "timeline" ("tribe_id", "name", "type", "is_global", "position", "created_by")
SELECT t."id", 'Global', 'posts', true, 0, t."created_by"
FROM "tribe" t
WHERE NOT EXISTS (SELECT 1 FROM "timeline" tl WHERE tl."tribe_id" = t."id" AND tl."is_global");

-- Deleting a timeline deletes its posts (owner, 2026-09-25): a private timeline's posts must never leak into Global
ALTER TABLE "post" ADD COLUMN IF NOT EXISTS "timeline_id" uuid REFERENCES "timeline"("id") ON DELETE CASCADE;

-- Every existing post moves into its tribe's Global
UPDATE "post" p
SET "timeline_id" = tl."id"
FROM "timeline" tl
WHERE tl."tribe_id" = p."tribe_id" AND tl."is_global" AND p."timeline_id" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_post_timeline_pinned_created"
  ON "post" ("timeline_id", "is_pinned" DESC, "created_at" DESC);

-- The member's selected timeline on the Timeline tab; null means Global
ALTER TABLE "tribe_member_preference"
  ADD COLUMN IF NOT EXISTS "selected_timeline_id" uuid REFERENCES "timeline"("id") ON DELETE SET NULL;

COMMIT;

-- Verify:
--   SELECT count(*) FROM tribe t WHERE NOT EXISTS (SELECT 1 FROM timeline tl WHERE tl.tribe_id = t.id AND tl.is_global);  -- 0
--   SELECT count(*) FROM post WHERE timeline_id IS NULL;                                                                    -- 0
--   SELECT count(*) FROM timeline WHERE is_global;                                                                          -- = tribe count
