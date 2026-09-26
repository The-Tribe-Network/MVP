import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { setTimelineMuted } from "@/lib/services/timeline";
import { jsonBody, parse, timelineRoute } from "@/lib/services/timeline-routes";
import { tribeTimelineParamsSchema } from "@/lib/validations/timeline";

const muteSchema = z.object({ muted: z.boolean() });

// PUT /api/tribes/:tribe_id/timelines/:timeline_id/mute { muted }: no @mention / reply notifications from it (TRI-317)
export async function PUT(request: NextRequest, ctx: RouteContext<"/api/tribes/[tribe_id]/timelines/[timeline_id]/mute">) {
  return timelineRoute("muting a timeline", async (userId) => {
    const params = parse(tribeTimelineParamsSchema, await ctx.params);
    if (!params.ok) return params.response;
    const body = parse(muteSchema, await jsonBody(request));
    if (!body.ok) return body.response;
    const isMuted = await setTimelineMuted(params.data.tribe_id, params.data.timeline_id, userId, body.data.muted);
    return NextResponse.json({ isMuted });
  });
}
