-- TRI-120 · keep a deleted photo's Cloudinary asset for 30 days before destroying it (owner, 2026-09-28: option c)
--
-- Hand-written and re-runnable. Purely additive; run it on every database before deploying the code.
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri120-media-purge.sql --endpoint <neon-endpoint-id>

BEGIN;

CREATE TABLE IF NOT EXISTS "media_purge" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "media_id" uuid NOT NULL,
  "public_id" text,
  "file_url" text NOT NULL,
  "media_row" jsonb,
  "deleted_at" timestamp DEFAULT now() NOT NULL,
  "purge_after" timestamp NOT NULL,
  "purged_at" timestamp
);

CREATE INDEX IF NOT EXISTS "idx_media_purge_due" ON "media_purge" ("purge_after") WHERE "purged_at" IS NULL;
CREATE INDEX IF NOT EXISTS "idx_media_purge_media" ON "media_purge" ("media_id");

COMMIT;

-- Verify:
--   SELECT to_regclass('public.media_purge');
