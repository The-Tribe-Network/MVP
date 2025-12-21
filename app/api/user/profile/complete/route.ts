import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { markProfileAsComplete, isProfileComplete } from "@/lib/services/user";
import type { User } from "@/lib/database/types";

/**
 * GET /api/user/profile/complete
 * Check if user profile is complete
 */
export async function GET() {
  try {
    const user: User | null = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profileComplete = await isProfileComplete(user.id);

    return NextResponse.json({
      isComplete: profileComplete,
      user: {
        displayName: user.displayName,
        username: user.username,
        location: user.location,
      },
    });
  } catch (error) {
    console.error("Error checking profile completion:", error);
    return NextResponse.json(
      { error: "Failed to check profile completion" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/profile/complete
 * Mark user profile as complete
 */
export async function POST(request: NextRequest) {
  try {
    const user: User | null = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify all required fields are present
    if (!user.displayName || !user.username || !user.location) {
      return NextResponse.json(
        {
          error: "Profile is incomplete. Missing required fields.",
          missing: {
            displayName: !user.displayName,
            username: !user.username,
            location: !user.location,
          },
        },
        { status: 400 }
      );
    }

    await markProfileAsComplete(user.id);

    return NextResponse.json({
      success: true,
      message: "Profile completed successfully",
    });
  } catch (error) {
    console.error("Error marking profile complete:", error);
    return NextResponse.json(
      { error: "Failed to complete profile" },
      { status: 500 }
    );
  }
}
