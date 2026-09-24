-- TRI-274 · at most one general-library album_media row per media
--
-- Hand-written and re-runnable (see tri9-post-payload.sql for why db:migrate is not used). Run:
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri274-album-media-general-unique.sql --endpoint <neon-endpoint-id>
--
-- The general library is album_media rows with album_id NULL. The (album_id, media_id) unique
-- constraint does not apply to NULLs, so a post photo got one general row at confirm and another at
-- post create (College Friends on Development: 100 rows for 92 media). The code no longer writes
-- duplicates (insertAlbumMediaRows in lib/services/album.ts skips media that already have a general
-- row); this removes the existing duplicates and adds a partial unique index so they cannot come back.
--
-- The dedupe keeps each media's earliest general row (added_at, then id) so the "added" time the
-- lists report does not move. Safe to run before or after the code deploy: the code only relies on
-- ON CONFLICT DO NOTHING, which also covers this index once it exists.

BEGIN;

DELETE FROM "album_media" am
USING "album_media" keep
WHERE am."album_id" IS NULL
  AND keep."album_id" IS NULL
  AND keep."media_id" = am."media_id"
  AND (keep."added_at", keep."id") < (am."added_at", am."id");

CREATE UNIQUE INDEX IF NOT EXISTS "uq_album_media_general_media_id"
  ON "album_media" ("media_id")
  WHERE "album_id" IS NULL;

COMMIT;

-- Verify:
--   SELECT media_id, count(*) FROM album_media WHERE album_id IS NULL GROUP BY media_id HAVING count(*) > 1;  -- no rows
--   SELECT indexname FROM pg_indexes WHERE tablename = 'album_media' AND indexname = 'uq_album_media_general_media_id';
