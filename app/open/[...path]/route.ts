import { NextRequest } from "next/server";

import { landingPage } from "@/lib/landing/page";

// Path segments of an app link: ids, route words, hyphens (tribe://tribe/<id>/events/<id>, tribe://notifications)
const SEGMENT = /^[A-Za-z0-9_-]{1,64}$/;

/**
 * GET /open/<path> — an email button's https stand-in for `tribe://<path>` (TRI-340), since mail clients strip custom
 * schemes. Opens the app on a phone; says what to do otherwise. Only plain path segments go into the link.
 */
export async function GET(_request: NextRequest, ctx: RouteContext<"/open/[...path]">) {
  const { path } = await ctx.params;
  if (path.length === 0 || path.length > 8 || !path.every((segment) => SEGMENT.test(segment))) {
    return landingPage({ title: "Tribe", heading: "This link doesn't work", lines: ["Open Tribe on your phone instead."], status: 400 });
  }
  return landingPage({
    title: "Open in Tribe",
    heading: "Open this in Tribe",
    lines: ["Tap the button on the phone where you use Tribe."],
    appLink: `tribe://${path.join("/")}`,
    getTheApp: true,
  });
}
