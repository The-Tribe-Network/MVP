import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { createEventComment, getEventComments } from "@/lib/services/comment";
import { getEventById } from "@/lib/services/event";
import { getMemberWithPermissions } from "@/lib/services/permissions";
import {
  createCommentSchema,
  validateApiRequest,
} from "@/lib/validations/comment";
import { z } from "zod";

// Validation schema for event comment route params
const tribeEventIdParamSchema = z.object({
  tribe_id: z.string().uuid("Invalid UUID format"),
  event_id: z.string().uuid("Invalid UUID format"),
});

/**
 * GET /api/tribes/[tribe_id]/events/[event_id]/comments
 * Fetch all comments for an event
 */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/events/[event_id]/comments'>
) {
  try {
    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id, event_id } = await ctx.params;

    // Validate parameters
    const paramValidation = validateApiRequest(tribeEventIdParamSchema, {
      tribe_id,
      event_id,
    });
    if (!paramValidation.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: paramValidation.error },
        { status: 400 }
      );
    }

    // Check tribe membership
    const memberData = await getMemberWithPermissions(
      paramValidation.data.tribe_id,
      user.id
    );
    if (!memberData) {
      return NextResponse.json(
        { error: "You are not a member of this tribe" },
        { status: 403 }
      );
    }

    // Verify event exists and belongs to tribe
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

    // Fetch comments
    const comments = await getEventComments(paramValidation.data.event_id, user.id);

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching event comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tribes/[tribe_id]/events/[event_id]/comments
 * Create a new comment on an event
 */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/events/[event_id]/comments'>
) {
  try {
    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tribe_id, event_id } = await ctx.params;

    // Validate parameters
    const paramValidation = validateApiRequest(tribeEventIdParamSchema, {
      tribe_id,
      event_id,
    });
    if (!paramValidation.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: paramValidation.error },
        { status: 400 }
      );
    }

    // Check tribe membership
    const memberData = await getMemberWithPermissions(
      paramValidation.data.tribe_id,
      user.id
    );
    if (!memberData) {
      return NextResponse.json(
        { error: "You are not a member of this tribe" },
        { status: 403 }
      );
    }

    // Verify event exists and belongs to tribe
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
    const newComment = await createEventComment(
      paramValidation.data.event_id,
      user.id,
      validation.data.content,
      validation.data.parentCommentId
    );

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Error creating event comment:", error);
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

