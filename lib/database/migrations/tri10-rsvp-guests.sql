-- TRI-10 · RSVP guest count and note, status pinned to an enum (DATA-MODEL-DELTA §1)
--
-- Hand-written and re-runnable, like tri9-post-payload.sql:
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri10-rsvp-guests.sql --endpoint <neon-endpoint-id>
--
-- Audit before running: SELECT status, COUNT(*) FROM event_attendee GROUP BY status;
-- Development (2026-09-22) held only 'going'. Anything else is backfilled to 'going' below, so the
-- cast cannot fail; the web app only ever wrote the three values.

BEGIN;

DO $$ BEGIN
  CREATE TYPE "public"."rsvp_status" AS ENUM('going', 'maybe', 'not_going');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "event_attendee" ADD COLUMN IF NOT EXISTS "guest_count" integer DEFAULT 0 NOT NULL;
ALTER TABLE "event_attendee" ADD COLUMN IF NOT EXISTS "note" text;

UPDATE "event_attendee" SET "status" = 'going' WHERE "status" NOT IN ('going', 'maybe', 'not_going');

-- Convert the free-text column in place; a re-run finds it already converted and skips.
DO $$ BEGIN
  IF (SELECT data_type FROM information_schema.columns
      WHERE table_name = 'event_attendee' AND column_name = 'status') = 'text' THEN
    ALTER TABLE "event_attendee" ALTER COLUMN "status" DROP DEFAULT;
    ALTER TABLE "event_attendee" ALTER COLUMN "status" TYPE "public"."rsvp_status" USING "status"::"public"."rsvp_status";
    ALTER TABLE "event_attendee" ALTER COLUMN "status" SET DEFAULT 'going';
  END IF;
END $$;

COMMIT;

-- Verify:
--   SELECT column_name, data_type, udt_name, column_default FROM information_schema.columns WHERE table_name = 'event_attendee';
--   SELECT status, COUNT(*) FROM event_attendee GROUP BY status;
