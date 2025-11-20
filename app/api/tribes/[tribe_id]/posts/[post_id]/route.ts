import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { getPostById, getPostByIdWithMetadata, updatePost, deletePost } from "@/lib/services/post";
import { checkTribeMembership } from "@/lib/services/permissions";
import { updatePostSchema, tribePostIdParamSchema, validateApiRequest } from "@/lib/validations/post";

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
        { error: "You must be a member of this tribe to view posts" },
        { status: 403 }
      );
    }

    // Fetch post with metadata
    const postData = await getPostByIdWithMetadata(
      paramValidation.data.post_id,
      user.id
    );

    if (!postData) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Verify post belongs to the tribe
    if (postData.tribeId !== paramValidation.data.tribe_id) {
      return NextResponse.json(
        { error: "Post does not belong to this tribe" },
        { status: 400 }
      );
    }

    return NextResponse.json(postData);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    // Parse and validate request body
    const body = await request.json();
    const validation = validateApiRequest(updatePostSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    // Update post (permission check is done inside updatePost)
    const updatedPost = await updatePost(
      paramValidation.data.post_id,
      user.id,
      validation.data.content
    );

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    if (error instanceof Error) {
      if (error.message.includes("permission") || error.message.includes("not found")) {
        const status = error.message.includes("not found") ? 404 : 403;
        return NextResponse.json({ error: error.message }, { status });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Delete post (permission check is done inside deletePost)
    await deletePost(paramValidation.data.post_id, user.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting post:", error);
    if (error instanceof Error) {
      if (error.message.includes("permission") || error.message.includes("not found")) {
        const status = error.message.includes("not found") ? 404 : 403;
        return NextResponse.json({ error: error.message }, { status });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}

