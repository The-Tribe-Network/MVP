import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { getCommentById, setCommentLike, toggleCommentLike } from "@/lib/services/comment";
import { getPostById } from "@/lib/services/post";
import { checkTribeMembership } from "@/lib/services/permissions";
import { tribePostCommentIdParamSchema, validateApiRequest } from "@/lib/validations/comment";

type Ctx = RouteContext<'/api/tribes/[tribe_id]/posts/[post_id]/comments/[comment_id]/like'>;

/**
 * Post-comment likes (TRI-361): `PUT` likes and `DELETE` unlikes, both safe to repeat (the app uses
 * these); `POST` toggles and stays for the web until it is cut over. All answer `{ isLiked, likeCount }`.
 */
export async function PUT(_request: NextRequest, ctx: Ctx) {
  return handle(ctx, true);
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  return handle(ctx, false);
}

export async function POST(_request: NextRequest, ctx: Ctx) {
  return handle(ctx, "toggle");
}

async function handle(ctx: Ctx, liked: boolean | "toggle") {
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

    const commentId = paramValidation.data.comment_id;
    const result =
      liked === "toggle" ? await toggleCommentLike(commentId, user.id) : await setCommentLike(commentId, user.id, liked);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error changing comment like:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to change comment like" },
      { status: 500 }
    );
  }
}

