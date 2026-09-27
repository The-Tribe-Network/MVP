import { NextRequest, NextResponse } from "next/server";
import { EMAIL_CATEGORIES, verifyUnsubscribeToken, type EmailCategory } from "@/lib/email/unsubscribe";
import { escapeHtml } from "@/lib/email/templates/content-report/escape";
import { setEmailOptIn } from "@/lib/services/email-preferences";

/**
 * Public unsubscribe (TRI-344): no sign-in, the signed token in `?token=` is the proof.
 *
 * - GET shows a confirm page and changes nothing: mail scanners open links, and must not unsubscribe anyone.
 * - POST unsubscribes. Mail clients' one-click button posts `List-Unsubscribe=One-Click` here (RFC 8058); the
 *   confirm page posts the same form. `action=resubscribe` undoes it.
 */

export async function GET(request: NextRequest) {
  const target = verifyUnsubscribeToken(request.nextUrl.searchParams.get("token"));
  if (!target) return invalidLink();
  const { label, description } = EMAIL_CATEGORIES[target.category];
  return page(
    `Unsubscribe from ${label}?`,
    `You'll stop getting ${description}. Security emails, like sign-in codes, still come.`,
    form(request, "unsubscribe", "Unsubscribe")
  );
}

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const target = verifyUnsubscribeToken(request.nextUrl.searchParams.get("token") ?? stringField(form, "token"));
  if (!target) return invalidLink();

  const resubscribe = stringField(form, "action") === "resubscribe";
  await setEmailOptIn(target.userId, target.category, resubscribe);

  // A mail client's one-click request only needs the status
  if (stringField(form, "List-Unsubscribe") === "One-Click") return new NextResponse(null, { status: 200 });
  return confirmation(request, target.category, resubscribe);
}

function confirmation(request: NextRequest, category: EmailCategory, resubscribed: boolean) {
  const { label } = EMAIL_CATEGORIES[category];
  return resubscribed
    ? page(`You're subscribed to ${label} again`, "You can unsubscribe any time from the link in those emails.", "")
    : page(`You're unsubscribed from ${label}`, "Changed your mind?", form(request, "resubscribe", "Subscribe again"));
}

function stringField(form: FormData | null, name: string): string | null {
  const value = form?.get(name);
  return typeof value === "string" ? value : null;
}

function form(request: NextRequest, action: "unsubscribe" | "resubscribe", label: string) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  return `<form method="post" action="/api/email/unsubscribe?token=${encodeURIComponent(token)}">
<input type="hidden" name="action" value="${action}">
<button type="submit" style="margin-top:8px;padding:12px 24px;font-size:16px;font-weight:600;color:#09090b;background:#ff6900;border:0;border-radius:8px;cursor:pointer">${escapeHtml(label)}</button>
</form>`;
}

function invalidLink() {
  return page("This link doesn't work", "It may have been copied incompletely. Use the unsubscribe link from the email again.", "", 400);
}

function page(heading: string, body: string, actionHtml: string, status = 200) {
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex"><title>${escapeHtml(heading)}</title></head>
<body style="margin:0;padding:48px 16px;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#09090b">
<main style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #e4e4e7;border-radius:12px;padding:24px">
<p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#c93d00">Tribe</p>
<h1 style="margin:0 0 12px;font-size:22px;line-height:28px">${escapeHtml(heading)}</h1>
<p style="margin:0 0 8px;font-size:16px;line-height:24px">${escapeHtml(body)}</p>
${actionHtml}
</main></body></html>`;
  return new NextResponse(html, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
