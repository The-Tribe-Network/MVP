import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { getUserSessions, revokeUserSession, revokeOtherSessions } from "@/lib/services/security";
import { revokeSessionSchema, validateApiRequest } from "@/lib/validations/security";

/**
 * GET /api/user/security/sessions
 * List all active sessions for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get user sessions with enriched device information
    const sessions = await getUserSessions();

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/security/sessions
 * Revoke session(s)
 * - If sessionToken in body: revoke specific session
 * - If no sessionToken: revoke all other sessions (current session preserved)
 */
export async function DELETE(request: NextRequest) {
  try {
    // 1. Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json().catch(() => ({}));

    // 3. If sessionToken provided, revoke specific session
    if (body.sessionToken) {
      const validation = validateApiRequest(revokeSessionSchema, body);
      if (!validation.success) {
        return NextResponse.json(
          { error: "Validation failed", details: validation.error },
          { status: 400 }
        );
      }

      const result = await revokeUserSession(validation.data.sessionToken);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to revoke session" },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, message: "Session revoked successfully" });
    }

    // 4. Otherwise, revoke all other sessions
    const result = await revokeOtherSessions();
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to revoke other sessions" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "All other sessions revoked successfully",
    });
  } catch (error) {
    console.error("Error revoking sessions:", error);
    return NextResponse.json(
      { error: "Failed to revoke sessions" },
      { status: 500 }
    );
  }
}

