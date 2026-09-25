-- TRI-237 · reports (store + email the tribe owner) and TRI-238 · user blocking
--
-- Hand-written and re-runnable, like tri15-member-profile.sql: the drizzle journal is behind the real
-- databases, so `db:migrate` cannot apply this. Run it directly:
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri237-238-reports-blocks.sql --endpoint <neon-endpoint-id>
--
-- Purely additive (three enums, two tables, their indexes; no backfill). Run it on every database before
-- deploying the code: every feed, comment, media, member and notification read anti-joins user_block.

BEGIN;

DO $$ BEGIN
  CREATE TYPE "public"."report_target_type" AS ENUM('post', 'comment', 'media', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE "public"."report_reason" AS ENUM('spam', 'harassment', 'hate', 'sexual_content', 'violence', 'self_harm', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE "public"."report_status" AS ENUM('open', 'dismissed', 'removed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── report (TRI-237) ──

CREATE TABLE IF NOT EXISTS "report" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "reporter_id" uuid NOT NULL,
  "tribe_id" uuid NOT NULL,
  "target_type" "report_target_type" NOT NULL,
  "target_id" uuid NOT NULL,
  "reason" "report_reason" NOT NULL,
  "note" text,
  "status" "report_status" DEFAULT 'open' NOT NULL,
  "resolved_by" uuid,
  "resolved_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "report" ADD CONSTRAINT "report_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "report" ADD CONSTRAINT "report_tribe_id_tribe_id_fk" FOREIGN KEY ("tribe_id") REFERENCES "public"."tribe"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "report" ADD CONSTRAINT "report_resolved_by_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- One open report per reporter per target (a repeat returns the existing row)
CREATE UNIQUE INDEX IF NOT EXISTS "report_open_reporter_target_unique"
  ON "report" ("reporter_id", "target_type", "target_id") WHERE "status" = 'open';
-- Per-reporter rate limit (last hour) and the future per-tribe queue (TRI-19)
CREATE INDEX IF NOT EXISTS "idx_report_reporter_created" ON "report" ("reporter_id", "created_at");
CREATE INDEX IF NOT EXISTS "idx_report_tribe_created" ON "report" ("tribe_id", "created_at");

-- ── user_block (TRI-238) ──

CREATE TABLE IF NOT EXISTS "user_block" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "blocker_id" uuid NOT NULL,
  "blocked_id" uuid NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "user_block_not_self" CHECK ("blocker_id" <> "blocked_id")
);

DO $$ BEGIN
  ALTER TABLE "user_block" ADD CONSTRAINT "user_block_blocker_id_user_id_fk" FOREIGN KEY ("blocker_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "user_block" ADD CONSTRAINT "user_block_blocked_id_user_id_fk" FOREIGN KEY ("blocked_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- Unique pair; its (blocker_id, blocked_id) index serves "whom did I block" and the forward anti-join probe
DO $$ BEGIN
  ALTER TABLE "user_block" ADD CONSTRAINT "user_block_blocker_blocked_unique" UNIQUE ("blocker_id", "blocked_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;
-- The reverse probe ("who blocked me")
CREATE INDEX IF NOT EXISTS "idx_user_block_blocked_blocker" ON "user_block" ("blocked_id", "blocker_id");

COMMIT;

-- Verify:
--   SELECT table_name FROM information_schema.tables WHERE table_name IN ('report', 'user_block');
--   SELECT indexname FROM pg_indexes WHERE tablename IN ('report', 'user_block');
