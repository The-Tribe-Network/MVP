import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { getTribeById } from "@/lib/services/tribe";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch tribe
    const tribeData = await getTribeById(id);

    if (!tribeData) {
      return NextResponse.json({ error: "Tribe not found" }, { status: 404 });
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
