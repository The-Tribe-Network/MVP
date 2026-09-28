import { eq } from "drizzle-orm";

import { db } from "@/lib/database/client";
import { user } from "@/lib/database/schemas";
import { emailLog } from "@/lib/database/schemas/email";
import { appName, sendEmail, supportEmail } from "./client";
import { renderEmail } from "./layout";
import { escapeHtml } from "./templates/content-report/escape";

/**
 * Security and account emails (TRI-348). Transactional: no category, so no unsubscribe link, and they go out
 * whatever the user's email opt-outs say. Each sender throws when the send fails; callers log and carry on, since
 * the change they report has already happened.
 */

const APP_LINK = "tribe://";
const support = supportEmail ? ` or write to ${supportEmail}` : "";

type Recipient = { email: string; name: string | null; displayName?: string | null };
const firstName = (r: Recipient) => (r.displayName || r.name || "").trim().split(/\s+/)[0] || "there";

/** After a password change (USET-04) or a reset with a code (AUTH-05). */
export async function sendPasswordChangedEmail(to: Recipient) {
  const { html, text } = renderEmail({
    heading: "Your password was changed",
    preheader: `The password for your ${appName} account was just changed.`,
    blocks: [
      `Hi ${firstName(to)}, the password for your ${appName} account was just changed, and every other device was signed out.`,
      `If this was you, there's nothing to do. If it wasn't, reset your password now from the ${appName} sign-in screen (Forgot password)${support}.`,
    ],
    reason: `This is a security notice about your ${appName} account. It's sent whenever the password changes.`,
  });
  return sendEmail({ to: to.email, subject: `Your ${appName} password was changed`, html, text });
}

/** After DELETE /me/account, to the address the account had before it was anonymized. */
export async function sendAccountDeletedEmail(to: Recipient) {
  const { html, text } = renderEmail({
    heading: "Your account was deleted",
    preheader: `Your ${appName} account is gone. This can't be undone.`,
    blocks: [
      `Hi ${firstName(to)}, your ${appName} account was deleted.`,
      "We removed your profile, sign-in, tribe memberships, RSVPs, drafts, notifications and the photos you uploaded. Posts, comments and events you created stay in their tribes, shown as \"Deleted user\".",
      "This can't be undone. You can sign up again with this email address any time.",
      ...(supportEmail ? [`If you didn't ask for this, write to ${supportEmail}.`] : []),
    ],
    reason: `This is the last email about your ${appName} account.`,
  });
  return sendEmail({ to: to.email, subject: `Your ${appName} account was deleted`, html, text });
}

/** After POST /me/account/deactivate (TRI-293). */
export async function sendAccountDeactivatedEmail(to: Recipient) {
  const { html, text } = renderEmail({
    heading: "Your account is deactivated",
    preheader: "Sign in again any time to reactivate it.",
    blocks: [
      `Hi ${firstName(to)}, your ${appName} account is deactivated. Your tribes won't see you in member lists, and you won't get notifications.`,
      "Your posts and photos stay where they are. Sign in again any time and everything comes back.",
    ],
    reason: `This is a notice about your ${appName} account.`,
  });
  return sendEmail({ to: to.email, subject: `Your ${appName} account is deactivated`, html, text });
}

/**
 * Welcome, once per user ever (`email_log` key `welcome`): after the first email verification, or on a social
 * sign-up (which arrives verified). Returns whether it was sent now.
 */
export async function sendWelcomeEmailOnce(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ email: user.email, name: user.name, displayName: user.displayName, deletedAt: user.deletedAt })
    .from(user)
    .where(eq(user.id, userId));
  if (!row || row.deletedAt) return false;
  const claimed = await db
    .insert(emailLog)
    .values({ userId, key: "welcome" })
    .onConflictDoNothing()
    .returning({ userId: emailLog.userId });
  if (claimed.length === 0) return false;

  const { html, text } = renderEmail({
    heading: `Welcome to ${appName}, ${firstName(row)}`,
    preheader: "Your group's home for plans, posts, chat and photos.",
    blocks: [
      `${appName} is a home for your group: one place for what you're planning and what you've shared.`,
      bullets([
        "Timeline: posts and group chat, in as many timelines as your group needs.",
        'Events: RSVPs, polls and reminders, so nobody asks "wait, when is it?"',
        "Media: shared albums for every trip and night out.",
      ]),
      "Start by creating a tribe for your people (Create a tribe, in the menu), or open the invite a friend sent you.",
    ],
    button: { label: `Open ${appName}`, url: APP_LINK },
    reason: `You're getting this because you just joined ${appName}.`,
  });
  await sendEmail({ to: row.email, subject: `Welcome to ${appName}`, html, text });
  return true;
}

function bullets(items: string[]) {
  return {
    html: `<ul style="margin:0 0 16px;padding-left:20px;font-size:16px;line-height:24px;color:#09090b">${items
      .map((item) => `<li style="margin:0 0 4px">${escapeHtml(item)}</li>`)
      .join("")}</ul>`,
    text: items.map((item) => `• ${item}`).join("\n"),
  };
}
