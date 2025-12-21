import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzleServerless } from "drizzle-orm/neon-serverless";
import { neon, Pool, neonConfig } from "@neondatabase/serverless";
import { config } from "dotenv";
import ws from "ws";
import * as schema from "@/lib/database/schemas";


config({ path: ".env" }); // or .env.local

const { DATABASE_URL } = process.env;

const sql = neon(DATABASE_URL!);
export const db = drizzle({ client: sql, schema });

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