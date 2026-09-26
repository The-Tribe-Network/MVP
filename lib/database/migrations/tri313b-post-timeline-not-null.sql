-- TRI-313 (part 2) · post.timeline_id NOT NULL
--
-- Run AFTER the TRI-313 code is deployed (see tri313-timelines.sql). Re-runnable. Catches tribes and posts that the
-- previous deployment created between part 1 and the deploy, then locks the column and
-- makes a timeline delete cascade to its posts.
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri313b-post-timeline-not-null.sql --endpoint <neon-endpoint-id>

BEGIN;

INSERT INTO "timeline" ("tribe_id", "name", "type", "is_global", "position", "created_by")
SELECT t."id", 'Global', 'posts', true, 0, t."created_by"
FROM "tribe" t
WHERE NOT EXISTS (SELECT 1 FROM "timeline" tl WHERE tl."tribe_id" = t."id" AND tl."is_global");

UPDATE "post" p
SET "timeline_id" = tl."id"
FROM "timeline" tl
WHERE tl."tribe_id" = p."tribe_id" AND tl."is_global" AND p."timeline_id" IS NULL;

ALTER TABLE "post" ALTER COLUMN "timeline_id" SET NOT NULL;

-- Deleting a timeline deletes its posts (owner, 2026-09-25). Databases that ran an earlier part 1 have the FK without
-- a cascade; recreate it either way.
ALTER TABLE "post" DROP CONSTRAINT IF EXISTS "post_timeline_id_fkey";
ALTER TABLE "post" ADD CONSTRAINT "post_timeline_id_fkey"
  FOREIGN KEY ("timeline_id") REFERENCES "timeline"("id") ON DELETE CASCADE;

COMMIT;

-- Verify:
--   SELECT confdeltype FROM pg_constraint WHERE conname = 'post_timeline_id_fkey';  -- c (cascade)
--   SELECT is_nullable FROM information_schema.columns WHERE table_name = 'post' AND column_name = 'timeline_id';  -- NO
