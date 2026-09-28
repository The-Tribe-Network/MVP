import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/database/client";
import { tribe, tribeInvitation, user } from "@/lib/database/schemas";
import { landingPage } from "@/lib/landing/page";
import { appLink } from "@/lib/services/notifications";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /i/:invitationId — the page an invite email's button opens (TRI-340). Public: the id is the secret, and the
 * page shows only what the email already said (tribe and inviter; never the invited address).
 */
export async function GET(_request: NextRequest, ctx: RouteContext<"/i/[invitation_id]">) {
  const { invitation_id } = await ctx.params;
  const [row] = UUID.test(invitation_id)
    ? await db
        .select({
          status: tribeInvitation.status,
          expiresAt: tribeInvitation.expiresAt,
          tribeName: tribe.name,
          inviterName: user.name,
          inviterDisplayName: user.displayName,
        })
        .from(tribeInvitation)
        .innerJoin(tribe, eq(tribe.id, tribeInvitation.tribeId))
        .innerJoin(user, eq(user.id, tribeInvitation.invitedBy))
        .where(eq(tribeInvitation.id, invitation_id))
        .limit(1)
    : [];

  if (!row) {
    return landingPage({
      title: "Invite not found · Tribe",
      heading: "This invite doesn't exist",
      lines: ["The link may be incomplete. Open it again from the email, or ask for a new invite."],
      status: 404,
    });
  }

  const inviter = row.inviterDisplayName || row.inviterName;
  const expired = row.expiresAt !== null && row.expiresAt <= new Date();
  if (row.status === "accepted") {
    return landingPage({
      title: `${row.tribeName} · Tribe`,
      heading: `You're already in ${row.tribeName}`,
      lines: ["This invite was accepted."],
      appLink: "tribe://",
      openLabel: "Open Tribe",
    });
  }
  if (row.status !== "pending" || expired) {
    return landingPage({
      title: `${row.tribeName} · Tribe`,
      heading: "This invite is no longer valid",
      lines: [`It was ${expired && row.status === "pending" ? "only good for a week" : "cancelled or declined"}. Ask ${inviter} for a new one.`],
      status: 410,
    });
  }

  return landingPage({
    title: `Join ${row.tribeName} on Tribe`,
    heading: `${inviter} invited you to ${row.tribeName}`,
    lines: [
      `${row.tribeName} uses Tribe for plans, posts, chat and photos.`,
      "Sign up with the email address this invite was sent to, then tap Open in Tribe to join.",
    ],
    appLink: appLink.invite(invitation_id),
    getTheApp: true,
  });
}
