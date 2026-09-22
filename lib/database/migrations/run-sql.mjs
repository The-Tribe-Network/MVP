/**
 * Runs a hand-written SQL migration file against DATABASE_URL (from .env).
 *
 * The target is named on the command line and must match the host in DATABASE_URL, so a file is
 * never applied to a database other than the one intended.
 *
 * Usage:
 *   node lib/database/migrations/run-sql.mjs <file.sql> --endpoint <neon-endpoint-id>
 *
 * Example:
 *   node lib/database/migrations/run-sql.mjs lib/database/migrations/tri9-post-payload.sql --endpoint ep-divine-term-ahpw8jvi
 */

import { readFileSync } from "node:fs";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { config } from "dotenv";
import ws from "ws";

config({ path: ".env" });

async function main() {
  const [file, flag, endpoint] = process.argv.slice(2);
  if (!file || flag !== "--endpoint" || !endpoint) {
    console.error("Usage: node lib/database/migrations/run-sql.mjs <file.sql> --endpoint <neon-endpoint-id>");
    process.exit(1);
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const host = new URL(url).hostname;
  if (!host.startsWith(endpoint)) {
    console.error(`Refusing to run: DATABASE_URL host is ${host}, expected endpoint ${endpoint}`);
    process.exit(1);
  }

  const sql = readFileSync(file, "utf8");
  console.log(`Applying ${file} to ${host}`);

  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: url });
  try {
    // No parameters, so this goes out as one simple query and may hold many statements.
    await pool.query(sql);
    console.log("Done");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
