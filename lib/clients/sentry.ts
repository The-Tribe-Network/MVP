import * as Sentry from "@sentry/nextjs";
import { after } from "next/server";
import type { ErrorEvent, NodeOptions } from "@sentry/nextjs";

/**
 * Sentry for the API (server runtime only). Off unless `SENTRY_DSN` is set, so local dev, CI and builds without
 * it send nothing. Uncaught handler errors reach Sentry through `onRequestError` (instrumentation.ts); the 500s
 * that handlers catch themselves are sent by `reportServerError` below.
 */

const SENSITIVE_HEADERS = ["authorization", "cookie", "set-cookie", "proxy-authorization"];

/** Drizzle's query errors end in `params: <bound values>` (emails, content): keep the query, drop the values. */
function redactQueryParams(message: string): string {
  return message.replace(/\nparams: [\s\S]*$/, "\nparams: [redacted]");
}

/**
 * Belt and braces on top of `dataCollection`: no credentials, cookies or bodies on an error event, and no bound
 * query values in exception messages.
 */
function scrubEvent(event: ErrorEvent): ErrorEvent {
  for (const exception of event.exception?.values ?? []) {
    if (exception.value) exception.value = redactQueryParams(exception.value);
  }
  if (event.message) event.message = redactQueryParams(event.message);
  const request = event.request;
  if (request) {
    if (request.headers) {
      request.headers = Object.fromEntries(
        Object.entries(request.headers).filter(([name]) => !SENSITIVE_HEADERS.includes(name.toLowerCase())),
      );
    }
    delete request.cookies;
    delete request.data;
  }
  return event;
}

/** The `Sentry.init` options, or null when `SENTRY_DSN` isn't set (Sentry stays off). */
export function sentryServerOptions(): NodeOptions | null {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return null;
  return {
    dsn,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA || undefined,
    // SDK v11's replacement for `sendDefaultPii: false` (its defaults collect all of these)
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: { request: { deny: SENSITIVE_HEADERS }, response: { deny: ["set-cookie"] } },
      httpBodies: [],
      databaseQueryData: false,
      stackFrameVariables: false,
      genAI: { inputs: false, outputs: false },
    },
    tracesSampleRate: 0.1,
    beforeSend: (event) => scrubEvent(event),
    // console.* breadcrumbs repeat whatever handlers log (errors with query values); Vercel's logs keep them
    beforeBreadcrumb: (breadcrumb) => (breadcrumb.category === "console" ? null : breadcrumb),
  };
}

/**
 * Send an error a route handler caught and answered 5xx to Sentry, tagged with the route pattern and method.
 * Call it next to the handler's `console.error`, only on the 5xx path (an expected 4xx is not an error).
 * A no-op without `SENTRY_DSN`.
 */
export function reportServerError(error: unknown, where: { route: string; method: string }): void {
  if (!process.env.SENTRY_DSN) return;
  Sentry.captureException(error, { tags: { route: where.route, method: where.method } });
  // The handler returns normally, so make sure the event leaves before the function is frozen.
  try {
    after(() => Sentry.flush(2000));
  } catch {
    // Outside a request scope (scripts, tests): nothing to wait for.
  }
}
