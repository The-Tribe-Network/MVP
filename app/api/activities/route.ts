import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { getUserTribesActivities } from "@/lib/services/activity";
import { getUserTribes } from "@/lib/services/tribe";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's tribes
    const userTribes = await getUserTribes(user.id);
    const tribeIds = userTribes.map((t) => t.id);

    if (tribeIds.length === 0) {
      return NextResponse.json([]);
    }

    // Get pagination params
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Fetch activities from all user's tribes
    const activities = await getUserTribesActivities(tribeIds, limit, offset);

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching user activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

