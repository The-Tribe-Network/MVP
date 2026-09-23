-- TRI-160 · signed direct upload + confirm flow + blurhash: media.public_id, media.blurhash
--
-- Hand-written and re-runnable (see tri9-post-payload.sql for why db:migrate is not used). Run:
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri160-media-public-id-blurhash.sql --endpoint <neon-endpoint-id>
--
-- Both columns are nullable, so this is additive and safe to run before the code. Run it on every
-- database before deploying the code: media selects read both columns and confirm writes them.
--
-- The backfill derives public_id from file_url for Cloudinary uploads
-- (https://res.cloudinary.com/<cloud>/image/upload/v<ver>/<public_id>.<ext>), which is exactly what
-- the old deleteMedia parsed at delete time. Rows whose URL does not match stay null and delete keeps
-- falling back to URL parsing. Duplicate file_urls (seed data) would collide with the unique index,
-- so only the oldest row of each URL gets the id.

BEGIN;

ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "public_id" text;
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "blurhash" text;

UPDATE "media" m
SET "public_id" = substring(m.file_url from '/upload/v[0-9]+/(.+)\.[A-Za-z0-9]+$')
WHERE m."public_id" IS NULL
  AND m.file_url ~ '/upload/v[0-9]+/.+\.[A-Za-z0-9]+$'
  AND m.id = (
    SELECT o.id FROM "media" o WHERE o.file_url = m.file_url ORDER BY o.created_at, o.id LIMIT 1
  );

CREATE UNIQUE INDEX IF NOT EXISTS "media_public_id_unique" ON "media" ("public_id");

COMMIT;

-- Verify:
--   SELECT count(*) AS total, count(public_id) AS with_public_id, count(blurhash) AS with_blurhash FROM media;
--   SELECT indexname FROM pg_indexes WHERE tablename = 'media' AND indexname = 'media_public_id_unique';
