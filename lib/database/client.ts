import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzleServerless } from "drizzle-orm/neon-serverless";
import { neon, Pool, neonConfig } from "@neondatabase/serverless";
import { config } from "dotenv";
import ws from "ws";
import * as schema from "@/lib/database/schemas";


config({ path: ".env" }); // or .env.local

const { DATABASE_URL } = process.env;

const sql = neon(DATABASE_URL!);
const httpDb = drizzle({ client: sql, schema });

/**
 * HTTP driver for single-statement queries.
 *
 * neon-http cannot run transactions: drizzle throws "No transactions support in neon-http driver"
 * at runtime (TRI-185). `transaction` is removed from the type so the misuse fails typecheck —
 * multi-statement writes go through `getDbTransaction().transaction(...)` instead.
 */
export const db: Omit<typeof httpDb, "transaction"> = httpDb;

let dbTransaction: ReturnType<typeof drizzleServerless> | null = null;

// WebSocket driver for transactions (only import when needed)
export function getDbTransaction() {
  if (!dbTransaction) {
    neonConfig.webSocketConstructor = ws;
    const pool = new Pool({ connectionString: DATABASE_URL! });
    dbTransaction = drizzleServerless({ client: pool, schema });
  }
  return dbTransaction;
}