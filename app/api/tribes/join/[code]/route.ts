import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { joinByInviteCode } from "@/lib/services/invite-link";

/**
 * POST /api/tribes/join/[code]
 *
 * Join via a shareable invite link (TRIBE-09 "Share Link", TSET-09, deep link `tribe://join/:code`).
 * The code is the only credential: no membership or invitation check beyond it. Returns the tribe;
 * `alreadyMember` tells the app whether anything happened, so a second tap on the same link is a
 * no-op rather than an error. Unknown code → 404, expired → 410 (mobile contract).
 */
export async function POST(
  _request: NextRequest,
  ctx: RouteContext<'/api/tribes/join/[code]'>
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await ctx.params;
    const result = await joinByInviteCode(code, user.id);

    switch (result.status) {
      case "not_found":
        return NextResponse.json({ error: "Invite link not found" }, { status: 404 });
      case "expired":
        return NextResponse.json({ error: "This invite link has expired" }, { status: 410 });
      case "already_member":
      case "joined":
        return NextResponse.json({ ...result.tribe, alreadyMember: result.status === "already_member" });
    }
  } catch (error) {
    console.error("Error joining by invite code:", error);
    return NextResponse.json({ error: "Failed to join tribe" }, { status: 500 });
  }
}
