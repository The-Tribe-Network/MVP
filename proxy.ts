import { NextResponse, type NextRequest } from "next/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Id segments nested under an event, and the literal sub-routes that share their position.
const NESTED_IDS = new Set(["comments", "polls", "links", "co-hosts"]);
const LITERALS = new Set(["request", "bulk-remove"]);

// tribe-api's front door sends the client's IP with a shared secret (TRI-480); see authClientIp below
const CLIENT_IP_HEADER = "x-tribe-client-ip";
const PROXY_SECRET_HEADER = "x-tribe-proxy-secret";

/** Constant-time string comparison, so the secret can't be guessed from response timing */
function sameSecret(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Auth routes: Better-Auth rate-limits and records sessions by client IP, read from x-tribe-client-ip first
 * (lib/clients/auth.ts). Only tribe-api can vouch for that header, so it is kept only when the shared secret
 * matches, and the secret itself never reaches a handler. Without PROXY_SHARED_SECRET nothing is trusted and
 * x-forwarded-for applies as before.
 */
function authClientIp(request: NextRequest) {
  const headers = new Headers(request.headers);
  const secret = process.env.PROXY_SHARED_SECRET;
  const sent = headers.get(PROXY_SECRET_HEADER);
  if (!secret || !sent || !sameSecret(sent, secret)) headers.delete(CLIENT_IP_HEADER);
  headers.delete(PROXY_SECRET_HEADER);
  return NextResponse.next({ request: { headers } });
}

/**
 * Event routes take uuids in the path. A malformed one used to reach Postgres ("invalid input syntax
 * for type uuid") and answer 500; it is a 400 here, before any handler runs (TRI-335).
 */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/auth/")) return authClientIp(request);
  // ["", "api", "tribes", tribe_id, "events", event_id, ...]
  const segments = request.nextUrl.pathname.split("/");
  const ids = [segments[3], segments[5]];
  for (let i = 7; i < segments.length; i += 1) {
    if (NESTED_IDS.has(segments[i - 1]) && !LITERALS.has(segments[i])) ids.push(segments[i]);
  }
  if (ids.some((id) => !id || !UUID.test(id))) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/auth/:path*",
    "/api/tribes/:tribe_id/events/:event_id",
    "/api/tribes/:tribe_id/events/:event_id/:path*",
  ],
};
