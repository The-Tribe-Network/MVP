import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { changePassword } from "@/lib/services/security";
import { changePasswordSchema, validateApiRequest } from "@/lib/validations/security";

/**
 * POST /api/user/security/password
 * Change user password
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate request body
    const body = await request.json();
    const validation = validateApiRequest(changePasswordSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    // 3. Change password using service
    const result = await changePassword({
      currentPassword: validation.data.currentPassword,
      newPassword: validation.data.newPassword,
      revokeOtherSessions: validation.data.revokeOtherSessions,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to change password" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}

