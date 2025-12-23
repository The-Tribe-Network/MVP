import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { transferOwnership } from "@/lib/services/tribe";
import {
  tribeIdParamSchema,
  transferOwnershipSchema,
  validateApiRequest,
} from "@/lib/validations/tribe";

/**
 * POST /api/tribes/[tribe_id]/transfer-ownership
 * Transfer tribe ownership to another member
 */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/tribes/[tribe_id]/transfer-ownership'>
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
    const validation = validateApiRequest(transferOwnershipSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    // Transfer ownership
    await transferOwnership(
      paramValidation.data.id,
      user.id,
      validation.data.newOwnerId
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error transferring ownership:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("permission")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message.includes("Not a member")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message.includes("must be an admin")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Failed to transfer ownership" },
      { status: 500 }
    );
  }
}

