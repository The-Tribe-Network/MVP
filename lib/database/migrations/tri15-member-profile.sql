-- TRI-15 · member profile: social links (one per network, decision TRI-81) and privacy preferences
--
-- Hand-written and re-runnable, like tri9-post-payload.sql: the drizzle journal is behind the real
-- databases, so `db:migrate` cannot apply this. Run it directly:
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri15-member-profile.sql --endpoint <neon-endpoint-id>
--
-- Purely additive (two new tables and one enum, no backfill): a user with no user_privacy row reads the
-- defaults. Safe to run before the code; run it on every database before deploying the code, since
-- GET /user/profile and GET /users/{id}/profile read both tables.

BEGIN;

DO $$ BEGIN
  CREATE TYPE "public"."social_network" AS ENUM('youtube', 'instagram', 'tiktok', 'x', 'website');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "user_social_link" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "network" "social_network" NOT NULL,
  "value" text NOT NULL,
  "order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "user_social_link" ADD CONSTRAINT "user_social_link_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- One link per network per user; also serves "links of a user" lookups (leading user_id)
DO $$ BEGIN
  ALTER TABLE "user_social_link" ADD CONSTRAINT "user_social_link_user_id_network_unique" UNIQUE ("user_id", "network");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "user_privacy" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "profile_visibility" text DEFAULT 'everyone' NOT NULL,
  "show_online_status" boolean DEFAULT true NOT NULL,
  "show_last_seen" boolean DEFAULT true NOT NULL,
  "show_email" boolean DEFAULT false NOT NULL,
  "show_location" boolean DEFAULT true NOT NULL,
  "show_join_date" boolean DEFAULT true NOT NULL,
  "show_shared_tribes" boolean DEFAULT true NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "user_privacy" ADD CONSTRAINT "user_privacy_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "user_privacy" ADD CONSTRAINT "user_privacy_user_id_unique" UNIQUE ("user_id");
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

-- Owner, 2026-09-25: profiles are public to everyone by default (PRD R9.1); also fixes databases created before that
ALTER TABLE "user_privacy" ALTER COLUMN "profile_visibility" SET DEFAULT 'everyone';

COMMIT;

-- Verify:
--   SELECT table_name, column_name, data_type FROM information_schema.columns
--   WHERE table_name IN ('user_social_link', 'user_privacy') ORDER BY table_name, ordinal_position;
--   SELECT conname FROM pg_constraint WHERE conrelid IN ('user_social_link'::regclass, 'user_privacy'::regclass);
