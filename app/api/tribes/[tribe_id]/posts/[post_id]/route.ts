import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { getPostByIdWithMetadata, updatePost, deletePost, verifyPostAccessAndMembership } from "@/lib/services/post";
import { updatePostSchema, tribePostIdParamSchema, validateApiRequest } from "@/lib/validations/post";

/**
 * OPTIMIZED: GET reduced from 2 sequential queries to 2 parallel queries
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/posts/[post_id]'>
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

    // Fetch post and verify access in parallel
    const [postAccess, postData] = await Promise.all([
      verifyPostAccessAndMembership(
        paramValidation.data.post_id,
        paramValidation.data.tribe_id,
        user.id
      ),
      getPostByIdWithMetadata(
        paramValidation.data.post_id,
        user.id
      ),
    ]);

    if (!postAccess || !postData) {
      return NextResponse.json(
        { error: "Post not found or you are not a member of this tribe" },
        { status: 404 }
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
  ctx: RouteContext<'/api/tribes/[tribe_id]/posts/[post_id]'>
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
  ctx: RouteContext<'/api/tribes/[tribe_id]/posts/[post_id]'>
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

