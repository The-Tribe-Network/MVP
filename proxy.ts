import { NextResponse, type NextRequest } from "next/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Id segments nested under an event, and the literal sub-routes that share their position.
const NESTED_IDS = new Set(["comments", "polls", "links", "co-hosts"]);
const LITERALS = new Set(["request", "bulk-remove"]);

/**
 * Event routes take uuids in the path. A malformed one used to reach Postgres ("invalid input syntax
 * for type uuid") and answer 500; it is a 400 here, before any handler runs (TRI-335).
 */
export function proxy(request: NextRequest) {
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
  matcher: ["/api/tribes/:tribe_id/events/:event_id", "/api/tribes/:tribe_id/events/:event_id/:path*"],
};
