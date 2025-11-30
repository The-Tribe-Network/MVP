import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { togglePostLike, verifyPostAccessAndMembership } from "@/lib/services/post";
import { tribePostIdParamSchema, validateApiRequest } from "@/lib/validations/post";

/**
 * OPTIMIZED: Reduced from 3 DB calls to 2 DB calls
 * - Combined checkTribeMembership + getPostById into single verifyPostAccessAndMembership query
 * - togglePostLike still needs to fetch post for activity creation (could be further optimized)
 */
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

    // Verify post exists, belongs to tribe, AND user is member (1 query instead of 2)
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

