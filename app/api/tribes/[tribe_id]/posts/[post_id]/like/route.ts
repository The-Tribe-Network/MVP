import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { togglePostLike, getPostById } from "@/lib/services/post";
import { checkTribeMembership } from "@/lib/services/permissions";
import { tribePostIdParamSchema, validateApiRequest } from "@/lib/validations/post";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tribe_id: string; post_id: string }> }
) {
  try {
    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id, post_id } = await params;

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

    // Check tribe membership
    const isMember = await checkTribeMembership(
      paramValidation.data.tribe_id,
      user.id
    );
    if (!isMember) {
      return NextResponse.json(
        { error: "You must be a member of this tribe to like posts" },
        { status: 403 }
      );
    }

    // Verify post belongs to the tribe
    const postData = await getPostById(paramValidation.data.post_id);
    if (!postData) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (postData.tribeId !== paramValidation.data.tribe_id) {
      return NextResponse.json(
        { error: "Post does not belong to this tribe" },
        { status: 400 }
      );
    }

    // Toggle like
    const isLiked = await togglePostLike(paramValidation.data.post_id, user.id);

    return NextResponse.json({ isLiked }, { status: 200 });
  } catch (error) {
    console.error("Error toggling post like:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to toggle post like" },
      { status: 500 }
    );
  }
}

