import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { getMemberWithPermissions } from "@/lib/services/permissions";
import {
  getEventsSettings,
  updateEventsSettings,
} from "@/lib/services/tribe-settings";
import {
  updateEventsSettingsSchema,
  validateApiRequest,
} from "@/lib/validations/tribe-settings";

/**
 * GET /api/tribes/[tribe_id]/settings/events
 * Get events settings for a tribe
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ tribe_id: string }> }
) {
  try {
    const { tribe_id } = await context.params;

    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check tribe membership
    const member = await getMemberWithPermissions(tribe_id, user.id);
    if (!member) {
      return NextResponse.json(
        { error: "You are not a member of this tribe" },
        { status: 403 }
      );
    }

    // Fetch events settings
    const settings = await getEventsSettings(tribe_id);

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching events settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch events settings" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tribes/[tribe_id]/settings/events
 * Update events settings for a tribe
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ tribe_id: string }> }
) {
  try {
    const { tribe_id } = await context.params;

    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check tribe membership and permissions
    const member = await getMemberWithPermissions(tribe_id, user.id);
    if (!member) {
      return NextResponse.json(
        { error: "You are not a member of this tribe" },
        { status: 403 }
      );
    }

    // Overrides win; otherwise owners and admins may edit (same rule as settings/timeline)
    const canEdit =
      member.permissions?.canEditTribeSettings ??
      (member.member.role === "owner" || member.member.role === "admin");

    if (!canEdit) {
      return NextResponse.json(
        { error: "You don't have permission to edit tribe settings" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateApiRequest(updateEventsSettingsSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Update events settings
    const updatedSettings = await updateEventsSettings(
      tribe_id,
      user.id,
      validation.data
    );

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("Error updating events settings:", error);
    return NextResponse.json(
      { error: "Failed to update events settings" },
      { status: 500 }
    );
  }
}
