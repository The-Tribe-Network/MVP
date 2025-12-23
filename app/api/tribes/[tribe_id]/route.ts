import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { getTribeById, updateTribe, deleteTribe } from "@/lib/services/tribe";
import { checkTribeMembership } from "@/lib/services/permissions";
import {
  tribeIdParamSchema,
  updateTribeSchema,
  deleteTribeConfirmationSchema,
  validateApiRequest,
} from "@/lib/validations/tribe";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]'>
) {
  try {
    // Check authentication
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

    // Fetch tribe
    const tribeData = await getTribeById(validation.data.id);

    if (!tribeData) {
      return NextResponse.json({ error: "Tribe not found" }, { status: 404 });
    }

    // Check if user is a member of the tribe
    const isMember = await checkTribeMembership(validation.data.id, user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: "You must be a member of this tribe to access it" },
        { status: 403 }
      );
    }

    return NextResponse.json(tribeData);
  } catch (error) {
    console.error("Error fetching tribe:", error);
    return NextResponse.json(
      { error: "Failed to fetch tribe" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tribes/[tribe_id]
 * Update tribe settings
 */
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]'>
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
    const validation = validateApiRequest(updateTribeSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    // Update tribe
    await updateTribe(paramValidation.data.id, user.id, validation.data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating tribe:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("permission")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message.includes("Not a member")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to update tribe" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tribes/[tribe_id]
 * Delete tribe (owner only)
 */
export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]'>
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

    // Validate confirmation in body
    const body = await request.json();
    const validation = validateApiRequest(deleteTribeConfirmationSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    // Delete tribe
    await deleteTribe(paramValidation.data.id, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tribe:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("permission")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message.includes("Not a member")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to delete tribe" },
      { status: 500 }
    );
  }
}

