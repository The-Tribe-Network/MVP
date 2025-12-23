import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { checkPermission } from "@/lib/services/role-permissions";
import {
  getMemberPermissionsDetail,
  updateMemberPermissions,
  resetMemberPermissions,
} from "@/lib/services/member-permissions";
import { updateMemberPermissionsSchema, validateApiRequest } from "@/lib/validations/permissions";

type RouteContext<T extends string> = {
  params: Promise<Record<string, string>>;
};

/**
 * GET /api/tribes/[tribe_id]/members/[member_id]/permissions
 *
 * Fetch detailed permission information for a specific member.
 * Includes individual overrides, role defaults, and effective permissions.
 *
 * @requires canManagePermissions permission
 * @returns Detailed member permission info
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/tribes/[tribe_id]/members/[member_id]/permissions">
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id, member_id } = await ctx.params;

    // Check if user can manage permissions
    const canManage = await checkPermission(tribe_id, user.id, "canManagePermissions");
    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const memberDetail = await getMemberPermissionsDetail(tribe_id, member_id);
    if (!memberDetail) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(memberDetail);
  } catch (error) {
    console.error("Error fetching member permissions:", error);
    return NextResponse.json({ error: "Failed to fetch member permissions" }, { status: 500 });
  }
}

/**
 * PUT /api/tribes/[tribe_id]/members/[member_id]/permissions
 *
 * Update individual member permission overrides.
 * Null values mean "use role default".
 *
 * @requires canManagePermissions permission
 * @body permissions - Object with nullable boolean permission values
 * @body restrictionReason - Optional reason for restrictions
 * @returns Success response
 */
export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/tribes/[tribe_id]/members/[member_id]/permissions">
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id, member_id } = await ctx.params;

    // Check if user can manage permissions
    const canManage = await checkPermission(tribe_id, user.id, "canManagePermissions");
    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate request body
    const body = await request.json();
    const validation = validateApiRequest(updateMemberPermissionsSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      );
    }

    await updateMemberPermissions(
      tribe_id,
      member_id,
      validation.data.permissions,
      validation.data.restrictionReason || null,
      user.id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating member permissions:", error);

    if (error instanceof Error && error.message === "Member not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to update member permissions" }, { status: 500 });
  }
}

/**
 * DELETE /api/tribes/[tribe_id]/members/[member_id]/permissions
 *
 * Reset member permissions to role defaults.
 * Deletes all individual permission overrides.
 *
 * @requires canManagePermissions permission
 * @returns Success response
 */
export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/tribes/[tribe_id]/members/[member_id]/permissions">
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id, member_id } = await ctx.params;

    // Check if user can manage permissions
    const canManage = await checkPermission(tribe_id, user.id, "canManagePermissions");
    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await resetMemberPermissions(tribe_id, member_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resetting member permissions:", error);
    return NextResponse.json({ error: "Failed to reset member permissions" }, { status: 500 });
  }
}
