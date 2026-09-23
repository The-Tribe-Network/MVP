import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { createPost, getTribePosts, PostInputError } from "@/lib/services/post";
import { checkTribeMembership } from "@/lib/services/permissions";
import { InvalidAlbumError } from "@/lib/services/album";
import { createPostSchema, listPostsQuerySchema, tribeIdParamSchema, validateApiRequest } from "@/lib/validations/post";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/posts'>
) {
  try {
    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id } = await ctx.params;

    // Validate tribe ID parameter
    const tribeValidation = validateApiRequest(tribeIdParamSchema, { tribe_id });
    if (!tribeValidation.success) {
      return NextResponse.json(
        { error: "Invalid tribe ID", details: tribeValidation.error },
        { status: 400 }
      );
    }

    // Check tribe membership
    const isMember = await checkTribeMembership(tribeValidation.data.tribe_id, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: "You must be a member of this tribe to view posts" },
        { status: 403 }
      );
    }

    // Get pagination and filter params
    const searchParams = request.nextUrl.searchParams;
    const queryValidation = validateApiRequest(listPostsQuerySchema, {
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      contentType: searchParams.get("contentType") ?? undefined,
    });
    if (!queryValidation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryValidation.error },
        { status: 400 }
      );
    }
    const { limit, offset, sort, contentType } = queryValidation.data;

    // Fetch posts
    const posts = await getTribePosts(
      tribeValidation.data.tribe_id,
      limit,
      offset,
      user.id,
      sort,
      contentType
    );

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/posts'>
) {
  try {
    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id } = await ctx.params;

    // Validate tribe ID parameter
    const tribeValidation = validateApiRequest(tribeIdParamSchema, { tribe_id });
    if (!tribeValidation.success) {
      return NextResponse.json(
        { error: "Invalid tribe ID", details: tribeValidation.error },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateApiRequest(createPostSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    // Create post (permission check is done inside createPost)
    const newPost = await createPost(tribeValidation.data.tribe_id, user.id, validation.data);

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    if (error instanceof PostInputError || error instanceof InvalidAlbumError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    }
    console.error("Error creating post:", error);
    if (error instanceof Error) {
      if (error.message.includes("permission")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

