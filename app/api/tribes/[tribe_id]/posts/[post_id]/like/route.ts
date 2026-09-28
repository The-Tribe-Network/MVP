import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { setPostLike, togglePostLike, verifyPostAccessAndMembership } from "@/lib/services/post";
import { tribePostIdParamSchema, validateApiRequest } from "@/lib/validations/post";

type Ctx = RouteContext<"/api/tribes/[tribe_id]/posts/[post_id]/like">;

/**
 * Post likes (TRI-361): `PUT` likes and `DELETE` unlikes, both safe to repeat (the app uses these); `POST` toggles
 * and stays for the web until it is cut over. All answer `{ isLiked, likeCount }`.
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
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id, post_id } = await ctx.params;
    const paramValidation = validateApiRequest(tribePostIdParamSchema, { tribe_id, post_id });
    if (!paramValidation.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: paramValidation.error },
        { status: 400 }
      );
    }

    // The post exists, belongs to the tribe, and the caller is a member (one query)
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

    const postId = paramValidation.data.post_id;
    const result =
      liked === "toggle" ? await togglePostLike(postId, user.id) : await setPostLike(postId, user.id, liked);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error changing post like:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to change post like" }, { status: 500 });
  }
}
