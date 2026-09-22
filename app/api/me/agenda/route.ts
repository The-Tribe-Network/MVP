import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/services/auth";
import { getAgenda } from "@/lib/services/agenda";
import { agendaQuerySchema, validateApiRequest } from "@/lib/validations/agenda";

/**
 * GET /api/me/agenda?from&to&tribeId&limit
 * Events across the caller's tribes in a date range, soonest first (mobile contract `getAgenda`, TRI-6)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = request.nextUrl.searchParams;
    const validation = validateApiRequest(agendaQuerySchema, {
      from: params.get("from") ?? undefined,
      to: params.get("to") ?? undefined,
      tribeId: params.get("tribeId") ?? undefined,
      limit: params.get("limit") ?? undefined,
    });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validation.error },
        { status: 400 }
      );
    }

    const items = await getAgenda(user.id, validation.data);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching agenda:", error);
    return NextResponse.json({ error: "Failed to fetch agenda" }, { status: 500 });
  }
}
