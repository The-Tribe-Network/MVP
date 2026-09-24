import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { checkTribeMembership } from "@/lib/services/permissions";
import {
  getFeaturedMedia,
  setFeaturedMedia,
  clearFeaturedMedia,
} from "@/lib/services/tribe";
import { tribeIdParamSchema, validateApiRequest } from "@/lib/validations/tribe";
import { z } from "zod";

const setFeaturedMediaSchema = z.object({
  mediaId: z.string().uuid("Invalid media ID"),
});

interface RouteParams {
  params: Promise<{ tribe_id: string }>;
}

/**
 * GET /api/tribes/[tribe_id]/featured-media
 * Get the featured media for a tribe
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/featured-media'>
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id } = await ctx.params;

    // Validate tribe ID parameter
    const validation = validateApiRequest(tribeIdParamSchema, { id: tribe_id });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid tribe ID", details: validation.error },
        { status: 400 }
      );
    }

    // Check if user is a member of the tribe
    const isMember = await checkTribeMembership(validation.data.id, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: "You must be a member of this tribe to access it" },
        { status: 403 }
      );
    }

    // Get featured media
    const featuredMedia = await getFeaturedMedia(validation.data.id, user.id);

    return NextResponse.json(featuredMedia);
  } catch (error) {
    console.error("Error fetching featured media:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured media" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tribes/[tribe_id]/featured-media
 * Set the featured media for a tribe (admin only)
 */
export async function PUT(
  request: NextRequest,
  ctx: RouteParams
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id } = await ctx.params;

    // Validate tribe ID parameter
    const paramValidation = validateApiRequest(tribeIdParamSchema, { id: tribe_id });
    if (!paramValidation.success) {
      return NextResponse.json(
        { error: "Invalid tribe ID", details: paramValidation.error },
        { status: 400 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validation = validateApiRequest(setFeaturedMediaSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    // Set featured media
    await setFeaturedMedia(
      paramValidation.data.id,
      validation.data.mediaId,
      user.id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting featured media:", error);

    if (error instanceof Error) {
      if (error.message.includes("Only admins")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message.includes("Not a member")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message.includes("not found")) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: "Failed to set featured media" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tribes/[tribe_id]/featured-media
 * Clear the featured media for a tribe (admin only)
 */
export async function DELETE(
  request: NextRequest,
  ctx: RouteParams
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id } = await ctx.params;

    // Validate tribe ID parameter
    const validation = validateApiRequest(tribeIdParamSchema, { id: tribe_id });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid tribe ID", details: validation.error },
        { status: 400 }
      );
    }

    // Clear featured media
    await clearFeaturedMedia(validation.data.id, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing featured media:", error);

    if (error instanceof Error) {
      if (error.message.includes("Only admins")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message.includes("Not a member")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to clear featured media" },
      { status: 500 }
    );
  }
}
