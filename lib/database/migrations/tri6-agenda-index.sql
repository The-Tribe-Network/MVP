-- TRI-6 · GET /me/agenda: index for "events of these tribes in this date range"
--
-- Hand-written and re-runnable (see tri9-post-payload.sql for why db:migrate is not used). Run:
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri6-agenda-index.sql --endpoint <neon-endpoint-id>
--
-- Index only, no data change: safe to run before or after the code (the agenda works without it,
-- just with a sequential scan of `event`). DATA-MODEL-DELTA §4.

BEGIN;

CREATE INDEX IF NOT EXISTS "idx_event_tribe_start" ON "event" ("tribe_id", "start_date");

COMMIT;

-- Verify:
--   SELECT indexname FROM pg_indexes WHERE tablename = 'event' AND indexname = 'idx_event_tribe_start';
