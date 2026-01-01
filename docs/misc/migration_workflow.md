  1. Add migration scripts to package.json

  {
    "scripts": {
      "db:generate": "drizzle-kit generate",
      "db:migrate": "drizzle-kit migrate",
      "db:studio": "drizzle-kit studio"
    }
  }

  2. The workflow

  # Step 1: Make changes to your schema files in lib/database/schemas/

  # Step 2: Generate a migration file (creates SQL in /drizzle folder)
  pnpm db:generate

  # Step 3: Review the generated SQL in /drizzle/*.sql
  # Drizzle will show you what it plans to do

  # Step 4: Apply the migration
  pnpm db:migrate

  3. Handling destructive changes

  When you rename a column or change a type, Drizzle generates a DROP + CREATE by default (which loses data). You can edit the generated SQL:

  -- Generated (loses data):
  ALTER TABLE "users" DROP COLUMN "name";
  ALTER TABLE "users" ADD COLUMN "full_name" text;

  -- Edit to (preserves data):
  ALTER TABLE "users" RENAME COLUMN "name" TO "full_name";

  4. For your Neon setup

  # Production (parent branch)
  DATABASE_URL=your_prod_url pnpm db:migrate

  # Preview (vercel-dev branch)
  DATABASE_URL=your_dev_url pnpm db:migrate

  When to use which:

  | Command            | Use case                                       |
  |--------------------|------------------------------------------------|
  | push-db            | Quick dev iteration, no data you care about    |
  | generate + migrate | Production, preserving data, team environments |