import { NextRequest, NextResponse } from "next/server";
import { markTimelineRead } from "@/lib/services/timeline";
import { parse, timelineRoute } from "@/lib/services/timeline-routes";
import { tribeTimelineParamsSchema } from "@/lib/validations/timeline";

// POST /api/tribes/:tribe_id/timelines/:timeline_id/read: the member opened it; unread starts again (TRI-314)
export async function POST(_request: NextRequest, ctx: RouteContext<"/api/tribes/[tribe_id]/timelines/[timeline_id]/read">) {
  return timelineRoute("marking a timeline read", async (userId) => {
    const params = parse(tribeTimelineParamsSchema, await ctx.params);
    if (!params.ok) return params.response;
    const lastReadAt = await markTimelineRead(params.data.tribe_id, params.data.timeline_id, userId);
    return NextResponse.json({ lastReadAt });
  });
}
