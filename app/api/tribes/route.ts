import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { createTribe, getUserTribes } from "@/lib/services/tribe";
import type { TribeWithCreator } from "@/lib/database/types";
import { createTribeSchema, validateApiRequest } from "@/lib/validations/tribe";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's tribes
    const userTribes = await getUserTribes(user.id);

    return NextResponse.json(userTribes);
  } catch (error) {
    console.error("Error fetching user tribes:", error);
    return NextResponse.json(
      { error: "Failed to fetch user tribes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    // Validate request body
    const validation = validateApiRequest(createTribeSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    // Parse invitations from request body if provided
    const invitations = body.invitations as
      | Array<{ email: string; role: "admin" | "moderator" | "member" }>
      | undefined;

    // Create tribe with validated data
    const newTribe = await createTribe(
      {
        name: validation.data.name,
        description: validation.data.description || undefined,
        avatar: validation.data.avatar || undefined,
        banner: validation.data.banner || undefined,
        location: validation.data.location || undefined,
        privacy: validation.data.privacy,
        category: validation.data.category,
        invitations,
      },
      user.id
    );

    return NextResponse.json(newTribe, { status: 201 });
  } catch (error) {
    console.error("Error creating tribe:", error);
    return NextResponse.json(
      { error: "Failed to create tribe" },
      { status: 500 }
    );
  }
}

