import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { toggleCommentLike, getCommentById } from "@/lib/services/comment";
import { getPostById } from "@/lib/services/post";
import { checkTribeMembership } from "@/lib/services/permissions";
import { tribePostCommentIdParamSchema, validateApiRequest } from "@/lib/validations/comment";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/posts/[post_id]/comments/[comment_id]/like'>
) {
  try {
    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id, post_id, comment_id } = await ctx.params;

    // Validate parameters
    const paramValidation = validateApiRequest(tribePostCommentIdParamSchema, {
      tribe_id,
      post_id,
      comment_id,
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
        { error: "You must be a member of this tribe to like comments" },
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

    // Verify comment belongs to the post
    const commentData = await getCommentById(paramValidation.data.comment_id);
    if (!commentData) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (commentData.postId !== paramValidation.data.post_id) {
      return NextResponse.json(
        { error: "Comment does not belong to this post" },
        { status: 400 }
      );
    }

    // Toggle like
    const isLiked = await toggleCommentLike(
      paramValidation.data.comment_id,
      user.id
    );

    return NextResponse.json({ isLiked }, { status: 200 });
  } catch (error) {
    console.error("Error toggling comment like:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to toggle comment like" },
      { status: 500 }
    );
  }
}

