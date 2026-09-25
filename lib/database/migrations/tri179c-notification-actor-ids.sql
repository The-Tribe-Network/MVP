-- TRI-179 (part 3) · notification.actor_ids: the distinct actors of a collapsed row (TRI-193 "count distinct actors")
--
-- Hand-written, additive, re-runnable (see tri9-post-payload.sql). Run BEFORE the code that writes it deploys:
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri179c-notification-actor-ids.sql --endpoint <neon-endpoint-id>
--
-- actor_count used to count switches between actors (A, B, A = 3); from now on it is cardinality(actor_ids). Existing
-- rows get their latest actor; their counts are left as they were. Actorless rows (reminders) count 0.

BEGIN;

ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS "actor_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL;
UPDATE "notification" SET "actor_ids" = ARRAY["actor_id"] WHERE "actor_id" IS NOT NULL AND "actor_ids" = '{}'::uuid[];

COMMIT;
