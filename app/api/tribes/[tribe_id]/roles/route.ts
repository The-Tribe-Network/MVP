import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { checkPermission, getAllRolePermissions } from "@/lib/services/role-permissions";

type RouteContext<T extends string> = {
  params: Promise<Record<string, string>>;
};

/**
 * GET /api/tribes/[tribe_id]/roles
 *
 * Fetch all role permissions for a tribe (owner, admin, moderator, member).
 * Returns both system defaults and tribe-specific overrides.
 *
 * @requires canManagePermissions permission
 * @returns Array of role permission configurations
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/tribes/[tribe_id]/roles">
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id } = await ctx.params;

    // Check if user can manage permissions
    const canManage = await checkPermission(tribe_id, user.id, "canManagePermissions");
    if (!canManage) {
      return NextResponse.json(
        { error: "You don't have permission to view role permissions" },
        { status: 403 }
      );
    }

    const rolePermissions = await getAllRolePermissions(tribe_id);

    return NextResponse.json(rolePermissions);
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    return NextResponse.json({ error: "Failed to fetch role permissions" }, { status: 500 });
  }
}
