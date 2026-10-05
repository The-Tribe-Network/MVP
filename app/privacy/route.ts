import { NextResponse } from "next/server";

/**
 * GET /privacy: the Privacy Policy now lives on the landing site (TRI-468). Older app builds, the App Store
 * listing and old emails still link here, so this stays as a permanent redirect.
 */
export function GET() {
  return NextResponse.redirect("https://tribehq.io/privacy", 308);
}
