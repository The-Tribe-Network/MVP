import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { blockUser, unblockUser } from "@/lib/services/blocks";

const ERRORS = {
  INVALID_USER_ID: { status: 400, error: "Invalid user id" },
  CANNOT_BLOCK_SELF: { status: 400, error: "You can't block yourself" },
  USER_NOT_FOUND: { status: 404, error: "User not found" },
} as const;

/**
 * POST /api/me/blocks/:userId (TRI-238)
 * Block a user: from now on neither of you sees the other's posts, comments, photos, RSVPs, member row, profile or
 * notifications, in either direction. Tribe membership is unchanged.
 * 201 `{ block: { user, createdAt }, created: true }` · 200 the same with `created: false` when already blocked ·
 * 400 `INVALID_USER_ID` | `CANNOT_BLOCK_SELF` · 401 · 404 `USER_NOT_FOUND` (unknown or deleted account).
 */
export async function POST(_request: NextRequest, ctx: RouteContext<"/api/me/blocks/[user_id]">) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { user_id } = await ctx.params;

    const result = await blockUser(user.id, user_id);
    if (!result.ok) {
      const { status, error } = ERRORS[result.code];
      return NextResponse.json({ error, code: result.code }, { status });
    }
    return NextResponse.json({ block: result.block, created: result.created }, { status: result.created ? 201 : 200 });
  } catch (error) {
    console.error("Error blocking user:", error);
    return NextResponse.json({ error: "Failed to block user" }, { status: 500 });
  }
}

/**
 * DELETE /api/me/blocks/:userId (TRI-238)
 * Unblock. Idempotent: 200 `{ success: true, removed }` (`removed: false` when there was no block).
 * 400 `INVALID_USER_ID` | `CANNOT_BLOCK_SELF` · 401.
 */
export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/me/blocks/[user_id]">) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { user_id } = await ctx.params;

    const result = await unblockUser(user.id, user_id);
    if (!result.ok) {
      const { status, error } = ERRORS[result.code];
      return NextResponse.json({ error, code: result.code }, { status });
    }
    return NextResponse.json({ success: true, removed: result.removed });
  } catch (error) {
    console.error("Error unblocking user:", error);
    return NextResponse.json({ error: "Failed to unblock user" }, { status: 500 });
  }
}
