import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { createTribe } from "@/lib/services/tribe";
import type { TribeWithCreator } from "@/lib/database/types";
import { createTribeSchema, validateApiRequest } from "@/lib/validations/tribe";

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

    // Create tribe with validated data
    const newTribe = await createTribe(
      {
        name: validation.data.name,
        description: validation.data.description || undefined,
        avatar: validation.data.avatar || undefined,
        location: validation.data.location || undefined,
        privacy: validation.data.privacy,
        category: validation.data.category,
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

