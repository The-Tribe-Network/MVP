import { isProduction } from "@/lib/utils";

/** Where the API is served in production when no base URL is configured. */
const PRODUCTION_BASE_URL = "https://api.tribehq.io";
const DEVELOPMENT_BASE_URL = "http://localhost:3000";

let warned = false;

/**
 * Public https origin that links in emails (and, by default, invite links) are built from (TRI-339).
 * `BETTER_AUTH_URL` wins, then `NEXT_PUBLIC_APP_URL`. Production never falls back to localhost: without either
 * variable it logs once and uses the API's own domain, so a link still reaches a host we own.
 */
export function publicBaseUrl(): string {
  const configured = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/+$/, "");
  if (!isProduction) return DEVELOPMENT_BASE_URL;
  if (!warned) {
    warned = true;
    console.error(`[config] BETTER_AUTH_URL is not set in production; email links use ${PRODUCTION_BASE_URL}`);
  }
  return PRODUCTION_BASE_URL;
}
