-- TRI-179 · notification record: actor, tribe, entity, dedupe key, read_at, per-channel delivery state
--
-- Hand-written and re-runnable (see tri9-post-payload.sql for why db:migrate is not used). Run:
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri179-notification-record.sql --endpoint <neon-endpoint-id>
--
-- Additive: new nullable/defaulted columns, a backfill of the rows written before notify() existed
-- (EVT-09 announcements and co-host requests, whose link is /tribes/<id>/events/<id>), indexes and the
-- notification_delivery table. Run it BEFORE the code deploys: drizzle's insert ... returning lists every
-- schema column. `is_read` is left in place because the code before this change still writes it; it leaves
-- the drizzle schema now and is dropped once this deploy is live (follow-up in TRI-179).

BEGIN;

ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS "actor_id" uuid;
ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS "actor_count" integer DEFAULT 1 NOT NULL;
ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS "tribe_id" uuid;
ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS "entity_type" text;
ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS "entity_id" uuid;
ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS "dedupe_key" text;
ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS "read_at" timestamp;
ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS "latest_at" timestamp;
ALTER TABLE "notification" ALTER COLUMN "is_read" SET DEFAULT false;

DO $$ BEGIN
  ALTER TABLE "notification" ADD CONSTRAINT "notification_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "notification" ADD CONSTRAINT "notification_tribe_id_tribe_id_fk" FOREIGN KEY ("tribe_id") REFERENCES "public"."tribe"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Backfill (only rows not yet backfilled): read state, the time the feed orders by, and tribe/event from the link
UPDATE "notification" SET "read_at" = "created_at" WHERE "is_read" AND "read_at" IS NULL;
UPDATE "notification" SET "latest_at" = "created_at" WHERE "latest_at" IS NULL;
ALTER TABLE "notification" ALTER COLUMN "latest_at" SET DEFAULT now();
ALTER TABLE "notification" ALTER COLUMN "latest_at" SET NOT NULL;
UPDATE "notification" n
SET "tribe_id" = t."id"
FROM "tribe" t
WHERE n."tribe_id" IS NULL
  AND n."link" ~ '^/tribes/[0-9a-f-]{36}'
  AND t."id" = substring(n."link" from '^/tribes/([0-9a-f-]{36})')::uuid;
UPDATE "notification" n
SET "entity_type" = 'event', "entity_id" = e."id"
FROM "event" e
WHERE n."entity_id" IS NULL
  AND n."link" ~ '^/tribes/[0-9a-f-]{36}/events/[0-9a-f-]{36}'
  AND e."id" = substring(n."link" from '^/tribes/[0-9a-f-]{36}/events/([0-9a-f-]{36})')::uuid;

CREATE INDEX IF NOT EXISTS "idx_notification_user_tribe_latest"
  ON "notification" ("user_id", "tribe_id", "latest_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_notification_user_unread"
  ON "notification" ("user_id") WHERE "read_at" IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "uq_notification_unread_dedupe"
  ON "notification" ("user_id", "dedupe_key") WHERE "read_at" IS NULL AND "dedupe_key" IS NOT NULL;

DO $$ BEGIN
  CREATE TYPE "public"."notification_channel" AS ENUM('push', 'email');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "public"."notification_delivery_status" AS ENUM('pending', 'sent', 'failed', 'suppressed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "notification_delivery" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "notification_id" uuid NOT NULL,
  "channel" "notification_channel" NOT NULL,
  "status" "notification_delivery_status" DEFAULT 'pending' NOT NULL,
  "attempts" integer DEFAULT 0 NOT NULL,
  "last_error" text,
  "sent_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "uq_notification_delivery_notification_channel" UNIQUE ("notification_id", "channel")
);

DO $$ BEGIN
  ALTER TABLE "notification_delivery" ADD CONSTRAINT "notification_delivery_notification_id_notification_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notification"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "idx_notification_delivery_channel_status"
  ON "notification_delivery" ("channel", "status");

COMMIT;

-- Verify:
--   SELECT type, tribe_id IS NOT NULL AS has_tribe, entity_type, count(*) FROM notification GROUP BY 1, 2, 3;
--   SELECT indexname FROM pg_indexes WHERE tablename IN ('notification', 'notification_delivery') ORDER BY 1;
