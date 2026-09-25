import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { getMemberWithPermissions } from "@/lib/services/permissions";
import { checkPermission } from "@/lib/services/role-permissions";
import { getTribeSettings } from "@/lib/services/tribe-settings";
import { db } from "@/lib/database/client";
import { tribeSettings } from "@/lib/database/schemas";
import { eq } from "drizzle-orm";
import { z } from "zod";

// A malformed id is a bad request, not a database error (TRI-247).
const tribeIdSchema = z.string().uuid();
const badTribeId = () => NextResponse.json({ error: "Invalid tribe id" }, { status: 400 });

const updateFeatureTogglesSchema = z.object({
  eventsEnabled: z.boolean().optional(),
  albumsEnabled: z.boolean().optional(),
  pollsEnabled: z.boolean().optional(),
});

/**
 * GET /api/tribes/[tribe_id]/settings
 * Get tribe settings (for feature toggles)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ tribe_id: string }> }
) {
  try {
    const { tribe_id } = await context.params;
    if (!tribeIdSchema.safeParse(tribe_id).success) return badTribeId();

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

    // Fetch tribe settings
    const settings = await getTribeSettings(tribe_id);

    // Return only feature toggles
    return NextResponse.json({
      eventsEnabled: settings.eventsEnabled,
      albumsEnabled: settings.albumsEnabled,
      pollsEnabled: settings.pollsEnabled,
    });
  } catch (error) {
    console.error("Error fetching tribe settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch tribe settings" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tribes/[tribe_id]/settings
 * Update feature toggles
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ tribe_id: string }> }
) {
  try {
    const { tribe_id } = await context.params;
    if (!tribeIdSchema.safeParse(tribe_id).success) return badTribeId();

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

    // Effective canEditTribeSettings (override → tribe role default → system default)
    const canEdit = await checkPermission(tribe_id, user.id, "canEditTribeSettings");

    if (!canEdit) {
      return NextResponse.json(
        { error: "You don't have permission to edit tribe settings" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateFeatureTogglesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Update settings
    const [updated] = await db
      .update(tribeSettings)
      .set({
        ...validation.data,
        updatedBy: user.id,
        updatedAt: new Date(),
      })
      .where(eq(tribeSettings.tribeId, tribe_id))
      .returning();

    if (!updated) {
      throw new Error("Failed to update feature toggles");
    }

    return NextResponse.json({
      eventsEnabled: updated.eventsEnabled,
      albumsEnabled: updated.albumsEnabled,
      pollsEnabled: updated.pollsEnabled,
    });
  } catch (error) {
    console.error("Error updating feature toggles:", error);
    return NextResponse.json(
      { error: "Failed to update feature toggles" },
      { status: 500 }
    );
  }
}
