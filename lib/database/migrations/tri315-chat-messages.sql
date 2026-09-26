-- TRI-315 · chat messages: chat_message, chat_message_media, chat_message_reaction; drop message / message_read
--
-- Hand-written and re-runnable. Run it on every database before deploying the code.
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri315-chat-messages.sql --endpoint <neon-endpoint-id>
--
-- Needs tri313-timelines.sql. The `message` / `message_read` tables were schema only (never built, 0 rows on
-- Development and Production, checked 2026-09-25); the owner chose to replace them (2026-09-25).

BEGIN;

DROP TABLE IF EXISTS "message_read";
DROP TABLE IF EXISTS "message";
DROP TYPE IF EXISTS "message_type";

CREATE TABLE IF NOT EXISTS "chat_message" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "timeline_id" uuid NOT NULL REFERENCES "timeline"("id") ON DELETE CASCADE,
  "tribe_id" uuid NOT NULL REFERENCES "tribe"("id") ON DELETE CASCADE,
  "author_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "body" text DEFAULT '' NOT NULL,
  "reply_to_id" uuid REFERENCES "chat_message"("id") ON DELETE SET NULL,
  "mention_user_ids" uuid[] DEFAULT '{}' NOT NULL,
  "link_preview" jsonb,
  "edited_at" timestamp,
  "deleted_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_chat_message_timeline_created"
  ON "chat_message" ("timeline_id", "created_at" DESC, "id" DESC);

CREATE TABLE IF NOT EXISTS "chat_message_media" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "message_id" uuid NOT NULL REFERENCES "chat_message"("id") ON DELETE CASCADE,
  "media_id" uuid NOT NULL REFERENCES "media"("id") ON DELETE CASCADE,
  "display_order" integer DEFAULT 0 NOT NULL,
  CONSTRAINT "uq_chat_message_media_media" UNIQUE ("media_id")
);
CREATE INDEX IF NOT EXISTS "idx_chat_message_media_message" ON "chat_message_media" ("message_id");

CREATE TABLE IF NOT EXISTS "chat_message_reaction" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "message_id" uuid NOT NULL REFERENCES "chat_message"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "emoji" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "uq_chat_message_reaction" UNIQUE ("message_id", "user_id", "emoji")
);

-- Chat messages can be reported (TRI-237's path)
ALTER TYPE "report_target_type" ADD VALUE IF NOT EXISTS 'message';

COMMIT;

-- Verify:
--   SELECT to_regclass('public.message'), to_regclass('public.chat_message'), to_regclass('public.chat_message_media'), to_regclass('public.chat_message_reaction');
--   SELECT unnest(enum_range(NULL::report_target_type));
