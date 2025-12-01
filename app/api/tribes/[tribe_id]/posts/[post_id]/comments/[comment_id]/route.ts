import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { updateComment, deleteComment, getCommentById } from "@/lib/services/comment";
import { getPostById } from "@/lib/services/post";
import { checkTribeMembership } from "@/lib/services/permissions";
import {
  updateCommentSchema,
  tribePostCommentIdParamSchema,
  validateApiRequest,
} from "@/lib/validations/comment";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/posts/[post_id]/comments/[comment_id]'>
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
        { error: "You must be a member of this tribe to edit comments" },
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

    // Parse and validate request body
    const body = await request.json();
    const validation = validateApiRequest(updateCommentSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    // Update comment (permission check is done inside updateComment)
    const updatedComment = await updateComment(
      paramValidation.data.comment_id,
      user.id,
      validation.data.content
    );

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    if (error instanceof Error) {
      if (error.message.includes("permission") || error.message.includes("not found")) {
        const status = error.message.includes("not found") ? 404 : 403;
        return NextResponse.json({ error: error.message }, { status });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/posts/[post_id]/comments/[comment_id]'>
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
        { error: "You must be a member of this tribe to delete comments" },
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

    // Delete comment (permission check is done inside deleteComment)
    await deleteComment(paramValidation.data.comment_id, user.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting comment:", error);
    if (error instanceof Error) {
      if (error.message.includes("permission") || error.message.includes("not found")) {
        const status = error.message.includes("not found") ? 404 : 403;
        return NextResponse.json({ error: error.message }, { status });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}

