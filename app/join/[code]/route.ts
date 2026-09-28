import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/database/client";
import { tribe } from "@/lib/database/schemas";
import { landingPage } from "@/lib/landing/page";
import { isWellFormedInviteCode, normalizeInviteCode } from "@/lib/services/invite-link";

/** GET /join/:code — the page a tribe's share link opens (TRI-340). Public: shows the tribe's name only. */
export async function GET(_request: NextRequest, ctx: RouteContext<"/join/[code]">) {
  const code = normalizeInviteCode((await ctx.params).code);
  const [row] = isWellFormedInviteCode(code)
    ? await db
        .select({ name: tribe.name, expiresAt: tribe.inviteCodeExpiresAt })
        .from(tribe)
        .where(eq(tribe.inviteCode, code))
        .limit(1)
    : [];

  if (!row || (row.expiresAt !== null && row.expiresAt <= new Date())) {
    return landingPage({
      title: "Invite link · Tribe",
      heading: "This invite link doesn't work any more",
      lines: ["It may have expired or been replaced. Ask whoever shared it for a new link."],
      status: 404,
    });
  }
  return landingPage({
    title: `Join ${row.name} on Tribe`,
    heading: `You're invited to ${row.name}`,
    lines: [`${row.name} uses Tribe for plans, posts, chat and photos. Tap Open in Tribe to join.`],
    appLink: `tribe://join/${code}`,
    getTheApp: true,
  });
}
