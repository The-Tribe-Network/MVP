import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { createRealtimeTokenRequest } from "@/lib/services/realtime";

/**
 * GET /api/realtime/token: an Ably token request for the signed-in member (TRI-316). The app's Ably client calls
 * this from `authCallback` (with the bearer token) and exchanges it with Ably; it can subscribe to the chat
 * timelines of the member's tribes only. 503 when real-time isn't configured on this server.
 */
export async function GET() {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const tokenRequest = await createRealtimeTokenRequest(user.id);
    if (!tokenRequest) {
      return NextResponse.json({ error: "Real-time is not configured", code: "REALTIME_UNAVAILABLE" }, { status: 503 });
    }
    return NextResponse.json(tokenRequest);
  } catch (error) {
    console.error("Error creating a realtime token:", error);
    return NextResponse.json({ error: "Failed to create a realtime token" }, { status: 500 });
  }
}
