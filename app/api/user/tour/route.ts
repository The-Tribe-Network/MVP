import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { isTourCompleted, markTourAsCompleted } from "@/lib/services/user";

/**
 * GET /api/user/tour
 * Check if user has completed the tour
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tourCompleted = await isTourCompleted(user.id);

    return NextResponse.json({ tourCompleted });
  } catch (error) {
    console.error("Error fetching tour status:", error);
    return NextResponse.json(
      { error: "Failed to fetch tour status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/tour
 * Mark tour as completed
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedUser = await markTourAsCompleted(user.id);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error completing tour:", error);
    return NextResponse.json(
      { error: "Failed to complete tour" },
      { status: 500 }
    );
  }
}

