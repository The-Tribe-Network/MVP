import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { togglePostPin, verifyPostAccessAndMembership } from "@/lib/services/post";
import { tribePostIdParamSchema, validateApiRequest } from "@/lib/validations/post";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/posts/[post_id]/pin'>
) {
  try {
    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id, post_id } = await ctx.params;

    // Validate parameters
    const paramValidation = validateApiRequest(tribePostIdParamSchema, {
      tribe_id,
      post_id,
    });
    if (!paramValidation.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: paramValidation.error },
        { status: 400 }
      );
    }

    // Verify post exists, belongs to tribe, AND user is member
    const postAccess = await verifyPostAccessAndMembership(
      paramValidation.data.post_id,
      paramValidation.data.tribe_id,
      user.id
    );

    if (!postAccess) {
      return NextResponse.json(
        { error: "Post not found or you are not a member of this tribe" },
        { status: 404 }
      );
    }

    // Toggle pin (moderation permission and the tribe's pinned-posts setting are checked inside)
    const isPinned = await togglePostPin(
      paramValidation.data.post_id,
      paramValidation.data.tribe_id,
      user.id
    );

    return NextResponse.json({ isPinned }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("permission")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error toggling post pin:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to toggle post pin" },
      { status: 500 }
    );
  }
}
