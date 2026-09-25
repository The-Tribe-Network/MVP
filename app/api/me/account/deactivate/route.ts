import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { deactivateAccount } from "@/lib/services/account";
import { deactivateAccountSchema } from "@/lib/validations/account";
import { validateApiRequest } from "@/lib/validations/profile";

/**
 * POST /api/me/account/deactivate
 * Deactivate the caller's account (USET-03, TRI-293). Body `{ confirmation: "DEACTIVATE" }` (`confirm` accepted
 * as an alias). Every session is revoked; the account is hidden from member lists, profiles, notifications and
 * invitations until the user signs in again, which reactivates it. Posts, comments and events stay visible.
 *
 * 200 `{ success: true }` · 400 `CONFIRMATION_REQUIRED` · 401 · 409 `{ code: "OWNS_TRIBES", tribes }` while the
 * caller owns a tribe (transfer or delete it first).
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const validation = validateApiRequest(deactivateAccountSchema, body ?? {});
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", code: "CONFIRMATION_REQUIRED", details: validation.error },
        { status: 400 }
      );
    }

    const result = await deactivateAccount(user.id);
    if (!result.ok) {
      return NextResponse.json(
        {
          error: "Transfer ownership of or delete your tribes before deactivating your account",
          code: result.code,
          tribes: result.tribes,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deactivating account:", error);
    return NextResponse.json({ error: "Failed to deactivate account" }, { status: 500 });
  }
}
