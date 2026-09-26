import { NextRequest, NextResponse } from "next/server";
import { reorderTimelines } from "@/lib/services/timeline";
import { jsonBody, parse, timelineRoute } from "@/lib/services/timeline-routes";
import { reorderTimelinesSchema } from "@/lib/validations/timeline";
import { tribeIdParamSchema } from "@/lib/validations/post";

// PUT /api/tribes/:tribe_id/timelines/order: every timeline id, in the new switcher order (TRI-314)
export async function PUT(request: NextRequest, ctx: RouteContext<"/api/tribes/[tribe_id]/timelines/order">) {
  return timelineRoute("reordering timelines", async (userId) => {
    const params = parse(tribeIdParamSchema, await ctx.params);
    if (!params.ok) return params.response;
    const body = parse(reorderTimelinesSchema, await jsonBody(request));
    if (!body.ok) return body.response;
    const timelines = await reorderTimelines(params.data.tribe_id, userId, body.data.timelineIds);
    return NextResponse.json({ timelines });
  });
}
