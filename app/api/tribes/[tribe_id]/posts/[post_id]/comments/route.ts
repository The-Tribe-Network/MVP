import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { createComment, getPostComments } from "@/lib/services/comment";
import { getPostById } from "@/lib/services/post";
import { checkTribeMembership } from "@/lib/services/permissions";
import {
  createCommentSchema,
  tribePostIdParamSchema,
  validateApiRequest,
} from "@/lib/validations/comment";
import { tribePostIdParamSchema as postTribePostIdParamSchema } from "@/lib/validations/post";

export async function GET(
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

    // Check tribe membership
    const isMember = await checkTribeMembership(
      paramValidation.data.tribe_id,
      user.id
    );
    if (!isMember) {
      return NextResponse.json(
        { error: "You must be a member of this tribe to view comments" },
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

    // Check tribe membership
    const isMember = await checkTribeMembership(
      paramValidation.data.tribe_id,
      user.id
    );
    if (!isMember) {
      return NextResponse.json(
        { error: "You must be a member of this tribe to comment" },
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

    // Parse and validate request body
    const body = await request.json();
    const validation = validateApiRequest(createCommentSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    // Create comment
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

