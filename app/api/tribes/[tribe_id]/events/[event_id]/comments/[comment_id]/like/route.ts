import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { toggleCommentLike, getCommentById } from "@/lib/services/comment";
import { getEventById } from "@/lib/services/event";
import { checkTribeMembership } from "@/lib/services/permissions";
import { tribeEventCommentIdParamSchema, validateApiRequest } from "@/lib/validations/comment";

/**
 * POST /api/tribes/[tribe_id]/events/[event_id]/comments/[comment_id]/like
 * Toggle like on an event comment
 */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/events/[event_id]/comments/[comment_id]/like'>
) {
  try {
    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id, event_id, comment_id } = await ctx.params;

    // Validate parameters
    const paramValidation = validateApiRequest(tribeEventCommentIdParamSchema, {
      tribe_id,
      event_id,
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

    // Verify event belongs to the tribe
    const eventData = await getEventById(paramValidation.data.event_id);
    if (!eventData) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (eventData.tribeId !== paramValidation.data.tribe_id) {
      return NextResponse.json(
        { error: "Event does not belong to this tribe" },
        { status: 400 }
      );
    }

    // Verify comment belongs to the event
    const commentData = await getCommentById(paramValidation.data.comment_id);
    if (!commentData) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (commentData.eventId !== paramValidation.data.event_id) {
      return NextResponse.json(
        { error: "Comment does not belong to this event" },
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
    console.error("Error toggling event comment like:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to toggle comment like" },
      { status: 500 }
    );
  }
}

