import { betterAuth } from "better-auth";
import { db } from "../database/client";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { user, session, account, verification } from "../database/schemas";

const { BETTER_AUTH_SECRET, BETTER_AUTH_URL, PUBLIC_APP_URL } = process.env;

if (!BETTER_AUTH_SECRET || !BETTER_AUTH_URL || !PUBLIC_APP_URL) {
  if (!BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET is not set");
  }
  if (!BETTER_AUTH_URL) {
    throw new Error("BETTER_AUTH_URL is not set");
  }
  if (!PUBLIC_APP_URL) {
    throw new Error("PUBLIC_APP_URL is not set");
  }
}

const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    }
  }),
  secret: BETTER_AUTH_SECRET,
  baseURL: BETTER_AUTH_URL,
  trustedOrigins: [PUBLIC_APP_URL],
});

export default auth;