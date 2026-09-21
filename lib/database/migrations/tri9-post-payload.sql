-- TRI-9 · post payload: kind, pin, event/poll links, post_media join, poll.post_id
--
-- Hand-written and re-runnable. The drizzle journal in this folder is behind the real databases
-- (they were built with `db:push`), so `db:migrate` cannot apply this. Run it directly:
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri9-post-payload.sql --endpoint <neon-endpoint-id>
--   (or: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f lib/database/migrations/tri9-post-payload.sql)
--
-- Do not `db:push` this change instead: push cannot run the backfills below. After this file has run,
-- `db:push` should report no pending changes for these tables.

BEGIN;

-- 1. Enum
DO $$ BEGIN
  CREATE TYPE "public"."post_kind" AS ENUM('text', 'photo', 'photos', 'event', 'poll', 'album', 'video', 'announcement');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. post columns
ALTER TABLE "post" ADD COLUMN IF NOT EXISTS "event_id" uuid;
ALTER TABLE "post" ADD COLUMN IF NOT EXISTS "poll_id" uuid;
ALTER TABLE "post" ADD COLUMN IF NOT EXISTS "kind" "post_kind" DEFAULT 'text' NOT NULL;
ALTER TABLE "post" ADD COLUMN IF NOT EXISTS "is_pinned" boolean DEFAULT false NOT NULL;
ALTER TABLE "post" ADD COLUMN IF NOT EXISTS "pinned_at" timestamp;
ALTER TABLE "post" ADD COLUMN IF NOT EXISTS "pinned_by" uuid;

-- 3. post_media join
CREATE TABLE IF NOT EXISTS "post_media" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "post_id" uuid NOT NULL,
  "media_id" uuid NOT NULL,
  "display_order" integer DEFAULT 0 NOT NULL,
  CONSTRAINT "post_media_post_id_media_id_unique" UNIQUE("post_id","media_id")
);

-- 4. poll: owned by an event or a post
ALTER TABLE "poll" ALTER COLUMN "event_id" DROP NOT NULL;
ALTER TABLE "poll" ADD COLUMN IF NOT EXISTS "post_id" uuid;

-- 5. Foreign keys and the owner check (no IF NOT EXISTS for constraints, so guard each one)
DO $$ BEGIN
  ALTER TABLE "post_media" ADD CONSTRAINT "post_media_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "post_media" ADD CONSTRAINT "post_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "poll" ADD CONSTRAINT "poll_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "post" ADD CONSTRAINT "post_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "post" ADD CONSTRAINT "post_poll_id_poll_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."poll"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "post" ADD CONSTRAINT "post_pinned_by_user_id_fk" FOREIGN KEY ("pinned_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "poll" ADD CONSTRAINT "poll_owner_check" CHECK (("poll"."event_id" IS NOT NULL) <> ("poll"."post_id" IS NOT NULL));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 6. Indexes
CREATE INDEX IF NOT EXISTS "idx_post_media_post_id" ON "post_media" USING btree ("post_id");
CREATE INDEX IF NOT EXISTS "idx_post_tribe_pinned_created" ON "post" USING btree ("tribe_id","is_pinned" DESC NULLS LAST,"created_at" DESC NULLS LAST);

-- 7. Backfill post_media from the legacy single image. media.post_id stays; the web app reads it.
INSERT INTO "post_media" ("post_id", "media_id", "display_order")
SELECT m."post_id", m."id", (ROW_NUMBER() OVER (PARTITION BY m."post_id" ORDER BY m."created_at", m."id") - 1)::int
FROM "media" m
WHERE m."post_id" IS NOT NULL AND m."file_type" = 'image'
ON CONFLICT ("post_id", "media_id") DO NOTHING;

-- 8. Backfill kind. Only rows still at the default are touched, so a re-run never overwrites kinds
--    written by the app. Photo beats album, matching createPost and the mobile client.
UPDATE "post" p SET "kind" = 'album'
WHERE p."kind" = 'text' AND p."linked_album_id" IS NOT NULL;

UPDATE "post" p SET "kind" = (CASE WHEN c.n > 1 THEN 'photos' ELSE 'photo' END)::"post_kind"
FROM (SELECT "post_id", COUNT(*) AS n FROM "post_media" GROUP BY "post_id") c
WHERE c."post_id" = p."id" AND p."kind" IN ('text', 'album');

COMMIT;

-- Verify (expect equal counts, and no rows from the last query):
--   SELECT COUNT(*) FROM media WHERE post_id IS NOT NULL AND file_type = 'image';
--   SELECT COUNT(*) FROM post_media;
--   SELECT kind, COUNT(*) FROM post GROUP BY kind;
--   SELECT id FROM poll WHERE (event_id IS NOT NULL) = (post_id IS NOT NULL);
