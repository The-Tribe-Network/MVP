import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { getPrivacyPreferences, updatePrivacyPreferences } from "@/lib/services/profile";
import { updatePrivacySchema, validateApiRequest } from "@/lib/validations/profile";

/**
 * GET /api/me/privacy
 * The caller's privacy preferences (USET-06, TRI-15); the defaults when they never saved any.
 */
export async function GET() {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(await getPrivacyPreferences(user.id));
  } catch (error) {
    console.error("Error fetching privacy preferences:", error);
    return NextResponse.json({ error: "Failed to fetch privacy preferences" }, { status: 500 });
  }
}

/**
 * PATCH /api/me/privacy
 * Partial update; returns the full preferences.
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const validation = validateApiRequest(updatePrivacySchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error }, { status: 400 });
    }

    return NextResponse.json(await updatePrivacyPreferences(user.id, validation.data));
  } catch (error) {
    console.error("Error updating privacy preferences:", error);
    return NextResponse.json({ error: "Failed to update privacy preferences" }, { status: 500 });
  }
}
