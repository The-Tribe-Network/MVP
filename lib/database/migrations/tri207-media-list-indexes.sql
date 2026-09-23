-- TRI-207 · GET /tribes/{tribeId}/media (listMedia): filters, sort and total
--
-- Hand-written and re-runnable (see tri9-post-payload.sql for why db:migrate is not used). Run:
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri207-media-list-indexes.sql --endpoint <neon-endpoint-id>
--
-- Indexes only, no data change: safe to run before or after the code (the listing works without them,
-- just with sequential scans). Measurements in docs/specs/TRI-207-list-media-filters.md §5.

BEGIN;

-- "This tribe's media, newest/oldest first" and the from/to window: an ordered index range scan
-- instead of a sequential scan of every tribe's media plus a sort. `id` is the sort's tie-break.
-- The listing and its `total` COUNT both filter on tribe_id first; there was no tribe_id index at all.
CREATE INDEX IF NOT EXISTS "idx_media_tribe_created" ON "media" ("tribe_id", "created_at", "id");

-- Media.commentCount is a correlated count per listed row (comments of the media's post). Without this
-- each row scans the whole comment table.
CREATE INDEX IF NOT EXISTS "idx_comment_post_id" ON "comment" ("post_id");

COMMIT;

-- Verify:
--   SELECT indexname FROM pg_indexes WHERE indexname IN ('idx_media_tribe_created', 'idx_comment_post_id');
