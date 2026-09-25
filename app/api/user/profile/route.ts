import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { checkUsernameAvailability } from "@/lib/services/user";
import { getSocialLinks, updateProfileWithSocialLinks } from "@/lib/services/profile";
import { updateProfileSchema, validateApiRequest } from "@/lib/validations/profile";

/**
 * PATCH /api/user/profile
 * Update user profile. `socialLinks` (TRI-15) replaces all of the caller's links; `[]` clears them.
 * Returns the user row plus `socialLinks`.
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateApiRequest(updateProfileSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    // If username is being updated, check availability
    if (validation.data.username && validation.data.username !== user.username) {
      const isAvailable = await checkUsernameAvailability(validation.data.username, user.id);
      if (!isAvailable) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 409 }
        );
      }
    }

    const updatedUser = await updateProfileWithSocialLinks(user.id, validation.data);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/profile
 * Get current user profile, plus `socialLinks` for the PROF-03 editor (TRI-15)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ ...user, socialLinks: await getSocialLinks(user.id) });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
