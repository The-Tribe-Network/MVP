import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { deleteAccount } from "@/lib/services/account";
import { deleteAccountSchema } from "@/lib/validations/account";
import { validateApiRequest } from "@/lib/validations/profile";

/**
 * DELETE /api/me/account
 * Delete the caller's account (USET-03, TRI-16). Body `{ confirmation: "DELETE" }` (`confirm` accepted as an
 * alias; `mode`, if sent, must be "delete" — deactivate is TRI-293). The account is anonymized, not erased:
 * posts, comments and events stay in their tribes as "Deleted user"; see lib/services/account.ts.
 *
 * 200 `{ success: true }` · 400 `CONFIRMATION_REQUIRED` (wrong / missing) or `MODE_NOT_SUPPORTED` · 401 · 409 `{ code: "OWNS_TRIBES", tribes }`
 * while the caller owns a tribe (transfer or delete it first). Every session is revoked on success.
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const validation = validateApiRequest(deleteAccountSchema, body ?? {});
    if (!validation.success) {
      const badMode = validation.details?.issues.some((issue) => issue.path[0] === "mode");
      return NextResponse.json(
        { error: "Validation failed", code: badMode ? "MODE_NOT_SUPPORTED" : "CONFIRMATION_REQUIRED", details: validation.error },
        { status: 400 }
      );
    }

    const result = await deleteAccount(user.id);
    if (!result.ok) {
      return NextResponse.json(
        {
          error: "Transfer ownership of or delete your tribes before deleting your account",
          code: result.code,
          tribes: result.tribes,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
