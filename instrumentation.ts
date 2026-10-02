import * as Sentry from "@sentry/nextjs";

/**
 * Sentry for the API (lib/clients/sentry.ts). Node runtime only: there are no edge routes, and proxy.ts runs on
 * Node in Next 16. Without `SENTRY_DSN` nothing is initialized.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
}

/** Uncaught errors in route handlers (and server components) are reported here. */
export const onRequestError = Sentry.captureRequestError;
