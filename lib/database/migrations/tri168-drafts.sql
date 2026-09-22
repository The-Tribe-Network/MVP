-- TRI-168 · server-side drafts for posts and events (decision TRI-99)
--
-- Hand-written and re-runnable, like tri9-post-payload.sql: the drizzle journal is behind the real
-- databases, so `db:migrate` cannot apply this. Run it directly:
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri168-drafts.sql --endpoint <neon-endpoint-id>
--
-- Purely additive; after it has run, `db:push` should report no pending changes for `draft`.

BEGIN;

DO $$ BEGIN
  CREATE TYPE "public"."draft_kind" AS ENUM('post', 'event');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "draft" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "tribe_id" uuid NOT NULL,
  "kind" "draft_kind" NOT NULL,
  "payload" jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "draft" ADD CONSTRAINT "draft_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "draft" ADD CONSTRAINT "draft_tribe_id_tribe_id_fk" FOREIGN KEY ("tribe_id") REFERENCES "public"."tribe"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "idx_draft_user_tribe_kind_updated" ON "draft" USING btree ("user_id","tribe_id","kind","updated_at" DESC NULLS LAST);

COMMIT;

-- Verify:
--   SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'draft' ORDER BY ordinal_position;
--   SELECT indexname FROM pg_indexes WHERE tablename = 'draft';
