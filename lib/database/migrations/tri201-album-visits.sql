-- TRI-201 · album detail "New today": tribe_member_preference.last_album_visit_at
--
-- Hand-written and re-runnable (see tri9-post-payload.sql for why db:migrate is not used). Run:
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri201-album-visits.sql --endpoint <neon-endpoint-id>
--
-- The column is nullable with no backfill, so this is additive and safe to run before the code.
-- Run it on every database before deploying the code: album GET reads and writes the column.

BEGIN;

-- albumId -> ISO timestamp of the member's last GET /tribes/{tid}/albums/{aid}. Album GET marks
-- media.isNew for items added to the album after that stamp (first visit: the last 24 h), then
-- stamps the visit. Null until the member opens an album.
ALTER TABLE "tribe_member_preference" ADD COLUMN IF NOT EXISTS "last_album_visit_at" jsonb;

COMMIT;

-- Verify:
--   SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'tribe_member_preference' AND column_name = 'last_album_visit_at';
