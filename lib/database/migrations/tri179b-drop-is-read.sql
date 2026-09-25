-- TRI-179 (part 2) · drop notification.is_read, replaced by read_at
--
-- Run ONLY after the TRI-179 code is live on the database's deployment: the code before it still writes
-- is_read. Re-runnable.
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri179b-drop-is-read.sql --endpoint <neon-endpoint-id>

BEGIN;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification' AND column_name = 'is_read') THEN
    UPDATE "notification" SET "read_at" = "created_at" WHERE "read_at" IS NULL AND "is_read";
    ALTER TABLE "notification" DROP COLUMN "is_read";
  END IF;
END $$;

COMMIT;
