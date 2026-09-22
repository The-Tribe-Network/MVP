import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { checkPermission } from "@/lib/services/role-permissions";
import { getInviteLink, rotateInviteLink } from "@/lib/services/invite-link";
import { tribeIdParamSchema, validateApiRequest } from "@/lib/validations/tribe";

/**
 * GET  /api/tribes/[tribe_id]/invite-link  — current shareable link (generated on first call)
 * POST /api/tribes/[tribe_id]/invite-link  — rotate: new code, old one stops working
 *
 * Both need `canInviteMembers` (DATA-MODEL-DELTA §5), same gate as email invitations.
 * Non-members get 403 too, so the response never reveals whether a tribe id exists.
 */
async function authorize(tribeIdRaw: string) {
  const user = await getServerUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const validation = validateApiRequest(tribeIdParamSchema, { id: tribeIdRaw });
  if (!validation.success) {
    return { error: NextResponse.json({ error: "Invalid tribe ID", details: validation.error }, { status: 400 }) };
  }

  const canInvite = await checkPermission(validation.data.id, user.id, "canInviteMembers");
  if (!canInvite) {
    return { error: NextResponse.json({ error: "You don't have permission to share invite links" }, { status: 403 }) };
  }

  return { tribeId: validation.data.id };
}

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/invite-link'>
) {
  try {
    const { tribe_id } = await ctx.params;
    const auth = await authorize(tribe_id);
    if ("error" in auth) return auth.error;

    const link = await getInviteLink(auth.tribeId);
    if (!link) {
      return NextResponse.json({ error: "Tribe not found" }, { status: 404 });
    }
    return NextResponse.json(link);
  } catch (error) {
    console.error("Error fetching invite link:", error);
    return NextResponse.json({ error: "Failed to fetch invite link" }, { status: 500 });
  }
}

export async function POST(
  _request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/invite-link'>
) {
  try {
    const { tribe_id } = await ctx.params;
    const auth = await authorize(tribe_id);
    if ("error" in auth) return auth.error;

    const link = await rotateInviteLink(auth.tribeId);
    if (!link) {
      return NextResponse.json({ error: "Tribe not found" }, { status: 404 });
    }
    return NextResponse.json(link);
  } catch (error) {
    console.error("Error rotating invite link:", error);
    return NextResponse.json({ error: "Failed to rotate invite link" }, { status: 500 });
  }
}
