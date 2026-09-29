import type { AlphaAccessSource } from "@/lib/database/schemas/alpha-access";
import { appName, sendEmail } from "./client";
import { renderEmail } from "./layout";

/**
 * The owner's "someone wants into the alpha" email (TRI-373): one per new `alpha_access` row, sent by
 * recordAccessRequest. The owner approves or revokes in the admin app (`ADMIN_APP_URL`, tribe-alpha-admin).
 */

export type AccessRequestNotice = { email: string; name: string | null; source: AlphaAccessSource };

const ADMIN_APP_URL = (process.env.ADMIN_APP_URL || "https://admin.tribehq.io").replace(/\/+$/, "");

const HOW: Record<AlphaAccessSource, string> = {
  sign_up: "signed up",
  sign_in: "tried to sign in with an account from before the alpha list",
  manual: "was added by hand",
  backfill: "was added when the alpha gate went live",
};

export async function sendAccessRequestEmail(to: string, request: AccessRequestNotice) {
  const who = request.name?.trim() ? `${request.name.trim()} (${request.email})` : request.email;
  const { html, text } = renderEmail({
    heading: "New alpha request",
    preheader: `${who} wants into the ${appName} alpha.`,
    blocks: [
      `${who} ${HOW[request.source]} and is waiting on the alpha list.`,
      "They can't get past sign-in until you approve them. Approving sends them a \"You're in\" email.",
    ],
    button: { label: "Review requests", url: `${ADMIN_APP_URL}/?tab=requested` },
    reason: `You're getting this because you're the ${appName} platform owner. One email per new request.`,
  });
  return sendEmail({ to, subject: `Alpha request: ${request.name?.trim() || request.email}`, html, text });
}
