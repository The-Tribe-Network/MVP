import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { getUserPendingInvitations } from "@/lib/services/invitation";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get pending invitations for the user
    const invitations = await getUserPendingInvitations(user.email);

    return NextResponse.json(invitations);
  } catch (error) {
    console.error("Error fetching user invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}

