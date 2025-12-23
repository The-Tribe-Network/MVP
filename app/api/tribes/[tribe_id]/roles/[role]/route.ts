import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { checkPermission, updateRolePermissions } from "@/lib/services/role-permissions";
import { updateRolePermissionsSchema, validateApiRequest } from "@/lib/validations/permissions";

type RouteContext<T extends string> = {
  params: Promise<Record<string, string>>;
};

/**
 * PATCH /api/tribes/[tribe_id]/roles/[role]
 *
 * Update tribe-specific role permission defaults.
 * Owner permissions cannot be modified.
 *
 * @requires canManagePermissions permission
 * @body permissions - Object with nullable boolean permission values
 * @returns Success response
 */
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/tribes/[tribe_id]/roles/[role]">
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id, role } = await ctx.params;

    // Check if user can manage permissions
    const canManage = await checkPermission(tribe_id, user.id, "canManagePermissions");
    if (!canManage) {
      return NextResponse.json(
        { error: "You don't have permission to manage role permissions" },
        { status: 403 }
      );
    }

    // Validate role parameter
    const validRoles = ["admin", "moderator", "member"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be one of: admin, moderator, member" },
        { status: 400 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validation = validateApiRequest(updateRolePermissionsSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      );
    }

    // Update role permissions
    await updateRolePermissions(tribe_id, role, validation.data.permissions, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating role permissions:", error);

    if (error instanceof Error && error.message.includes("Owner permissions")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to update role permissions" }, { status: 500 });
  }
}
