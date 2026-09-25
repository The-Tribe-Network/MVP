-- TRI-7 · tribe_member_preference.notifications_muted (NOTIF-04) + one preference row per membership
--
-- Hand-written and re-runnable (see tri9-post-payload.sql). Run BEFORE the code deploys:
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri7-notifications-muted.sql --endpoint <neon-endpoint-id>
--
-- Most members have no preference row yet (they are created lazily), and nothing stopped two rows for one membership.
-- Duplicates, if any, keep the earliest row; then a unique key lets the mute toggle upsert.

BEGIN;

ALTER TABLE "tribe_member_preference" ADD COLUMN IF NOT EXISTS "notifications_muted" boolean DEFAULT false NOT NULL;

DELETE FROM "tribe_member_preference" p
USING "tribe_member_preference" keep
WHERE keep."tribe_member_id" = p."tribe_member_id"
  AND (keep."created_at", keep."id") < (p."created_at", p."id");

DO $$ BEGIN
  ALTER TABLE "tribe_member_preference" ADD CONSTRAINT "uq_tribe_member_preference_member" UNIQUE ("tribe_member_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

COMMIT;
