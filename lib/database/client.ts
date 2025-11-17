import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" }); // or .env.local

const { DATABASE_URL } = process.env;

const sql = neon(DATABASE_URL!);
export const db = drizzle({ client: sql });
