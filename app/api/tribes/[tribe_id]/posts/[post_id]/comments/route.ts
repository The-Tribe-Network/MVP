import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { createComment, getPostComments } from "@/lib/services/comment";
import { verifyPostAccessAndMembership } from "@/lib/services/post";
import {
  createCommentSchema,
  validateApiRequest,
} from "@/lib/validations/comment";
import { tribePostIdParamSchema as postTribePostIdParamSchema } from "@/lib/validations/post";

/**
 * OPTIMIZED: GET reduced from 2 DB calls to 1 DB call
 * POST reduced from 3 DB calls to 2 DB calls
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/posts/[post_id]/comments'>
) {
  try {
    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id, post_id } = await ctx.params;

    // Validate parameters
    const paramValidation = validateApiRequest(postTribePostIdParamSchema, {
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

    // Fetch comments
    const comments = await getPostComments(paramValidation.data.post_id, user.id);

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/posts/[post_id]/comments'>
) {
  try {
    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id, post_id } = await ctx.params;

    // Validate parameters
    const paramValidation = validateApiRequest(postTribePostIdParamSchema, {
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

    // Parse and validate request body
    const body = await request.json();
    const validation = validateApiRequest(createCommentSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    // Create comment (note: createComment internally calls getPostById again - could be further optimized)
    const newComment = await createComment(
      paramValidation.data.post_id,
      user.id,
      validation.data.content,
      validation.data.parentCommentId
    );

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    if (error instanceof Error) {
      if (error.message.includes("permission")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

