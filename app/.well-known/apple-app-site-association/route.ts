import { NextResponse } from "next/server";

// The production iOS app: Team ID + bundle id (App Store Connect, 2026-10-01).
const APP_ID = "692FVT6SY9.com.tribenetwork.tribe";

/**
 * GET /.well-known/apple-app-site-association — lets iOS open these links in the Tribe app instead of the browser
 * (TRI-251; the app's production build has `applinks:api.tribehq.io`). The paths are the landing pages: invitations
 * (/i), invite links (/join) and shared app links (/open). Without the app installed, they still open those pages.
 */
export function GET() {
  return NextResponse.json(
    {
      applinks: {
        details: [
          {
            appIDs: [APP_ID],
            components: [{ "/": "/join/*" }, { "/": "/i/*" }, { "/": "/open/*" }],
          },
        ],
      },
    },
    { headers: { "cache-control": "public, max-age=3600" } },
  );
}
