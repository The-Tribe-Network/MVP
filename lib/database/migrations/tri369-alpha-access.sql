-- TRI-369 · alpha allowlist: one row per email, requested → approved / revoked by the owner
--
-- Hand-written and re-runnable. Purely additive; run it on every database before deploying the code that reads it
-- (the TRI-370 gate queries this table on every sign-in).
--
--   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri369-alpha-access.sql --endpoint <neon-endpoint-id>
--
-- Existing users are NOT approved here (owner, 2026-09-28). The Production rollout (TRI-374) backfills them as
-- `requested` in a separate step.

BEGIN;

CREATE TABLE IF NOT EXISTS "alpha_access" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "status" text NOT NULL,
  "user_id" uuid REFERENCES "user"("id") ON DELETE SET NULL,
  "source" text NOT NULL,
  "note" text,
  "requested_at" timestamp DEFAULT now() NOT NULL,
  "approved_at" timestamp,
  "revoked_at" timestamp,
  "owner_notified_at" timestamp,
  CONSTRAINT "alpha_access_status" CHECK ("status" IN ('requested', 'approved', 'revoked')),
  CONSTRAINT "alpha_access_source" CHECK ("source" IN ('sign_up', 'sign_in', 'manual', 'backfill'))
);

CREATE UNIQUE INDEX IF NOT EXISTS "uq_alpha_access_email" ON "alpha_access" (lower("email"));
CREATE INDEX IF NOT EXISTS "idx_alpha_access_user_id" ON "alpha_access" ("user_id");

-- Least-privilege grants for the admin app (TRI-372). The role itself is created per branch in Neon (it has a
-- password), so this block only applies when it exists; re-run the file after creating it.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'alpha_admin') THEN
    GRANT USAGE ON SCHEMA public TO alpha_admin;
    GRANT SELECT, INSERT, UPDATE ON "alpha_access" TO alpha_admin;
    GRANT SELECT ("id", "email", "name", "created_at") ON "user" TO alpha_admin;
    -- Revoke signs the user out: DELETE needs SELECT on the column in its WHERE
    GRANT SELECT ("user_id"), DELETE ON "session" TO alpha_admin;
  END IF;
END $$;

COMMIT;

-- Verify:
--   SELECT to_regclass('public.alpha_access');
--   SELECT indexname FROM pg_indexes WHERE tablename = 'alpha_access';
