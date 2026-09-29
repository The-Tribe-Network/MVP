import { appName, supportEmail } from "./client";
import { escapeHtml } from "./templates/content-report/escape";
import { EMAIL_CATEGORIES, unsubscribeUrl, type EmailCategory } from "./unsubscribe";

/** A paragraph of plain text (escaped for HTML here), or a block with its own HTML and text versions. */
export type EmailBlock = string | { html: string; text: string };

export interface EmailContent {
  /** Subject-like heading at the top of the email */
  heading: string;
  /** Inbox preview line; hidden in the body */
  preheader?: string;
  blocks: EmailBlock[];
  button?: { label: string; url: string };
  /** Why the recipient got this, e.g. "You're going to Game night in College Friends." */
  reason: string;
  /** Adds the unsubscribe line (and `sendEmail` adds the one-click headers). Omit for security email. */
  unsubscribe?: { userId: string; category: EmailCategory };
}

// Tribe tokens (tribe-mobile DESIGN-SYSTEM §1.1): orange with near-black text passes contrast; `primary-text` for links
const COLOR = {
  primary: "#ff6900",
  onPrimary: "#09090b",
  primaryText: "#c93d00",
  text: "#09090b",
  muted: "#67676f",
  border: "#e4e4e7",
  page: "#fafafa",
  card: "#ffffff",
} as const;

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/**
 * The one shell every new email uses (TRI-344): heading, content, an optional button, and a footer with why the
 * email came, the support address and, for opt-out categories, an unsubscribe link. Inline styles only: several
 * mail clients drop <style>. Returns the HTML and the plain-text version together so they can't drift.
 */
export function renderEmail(content: EmailContent): { html: string; text: string } {
  const unsubscribe = content.unsubscribe
    ? { url: unsubscribeUrl(content.unsubscribe.userId, content.unsubscribe.category), label: EMAIL_CATEGORIES[content.unsubscribe.category].label }
    : null;

  const blocksHtml = content.blocks
    .map((block) =>
      typeof block === "string"
        ? `<p style="margin:0 0 16px;font-size:16px;line-height:24px;color:${COLOR.text}">${escapeHtml(block)}</p>`
        : block.html
    )
    .join("\n");

  const buttonHtml = content.button
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 16px"><tr><td style="border-radius:8px;background:${COLOR.primary}">
<a href="${escapeHtml(content.button.url)}" style="display:inline-block;padding:12px 24px;font-size:16px;font-weight:600;color:${COLOR.onPrimary};text-decoration:none;border-radius:8px">${escapeHtml(content.button.label)}</a>
</td></tr></table>`
    : "";

  const footerLines = [
    escapeHtml(content.reason),
    supportEmail
      ? `Questions? Write to <a href="mailto:${escapeHtml(supportEmail)}" style="color:${COLOR.primaryText}">${escapeHtml(supportEmail)}</a>.`
      : null,
    unsubscribe
      ? `<a href="${escapeHtml(unsubscribe.url)}" style="color:${COLOR.primaryText}">Unsubscribe from ${escapeHtml(unsubscribe.label)}</a>`
      : null,
    `© ${new Date().getFullYear()} ${escapeHtml(appName)}`,
  ].filter(Boolean);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<title>${escapeHtml(content.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${COLOR.page};font-family:${FONT}">
${content.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(content.preheader)}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR.page}"><tr><td align="center" style="padding:24px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding:0 0 16px;font-size:20px;font-weight:700;color:${COLOR.primaryText}">${escapeHtml(appName)}</td></tr>
<tr><td style="background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:12px;padding:24px">
<h1 style="margin:0 0 16px;font-size:22px;line-height:28px;color:${COLOR.text}">${escapeHtml(content.heading)}</h1>
${blocksHtml}
${buttonHtml}
</td></tr>
<tr><td style="padding:16px 8px 0;font-size:13px;line-height:20px;color:${COLOR.muted}">
${footerLines.map((line) => `<p style="margin:0 0 8px">${line}</p>`).join("\n")}
</td></tr>
</table>
</td></tr></table>
</body>
</html>`;

  const text = [
    content.heading,
    "",
    ...content.blocks.flatMap((block) => [typeof block === "string" ? block : block.text, ""]),
    ...(content.button ? [`${content.button.label}: ${content.button.url}`, ""] : []),
    "—",
    content.reason,
    ...(supportEmail ? [`Questions? Write to ${supportEmail}.`] : []),
    ...(unsubscribe ? [`Unsubscribe from ${unsubscribe.label}: ${unsubscribe.url}`] : []),
  ].join("\n");

  return { html, text };
}

/** A one-time code, large and spaced so it reads (and copies) at a glance (TRI-375). */
export function codeBlock(code: string): { html: string; text: string } {
  return {
    html: `<p style="margin:4px 0 20px;padding:16px;background:${COLOR.page};border:1px solid ${COLOR.border};border-radius:8px;text-align:center;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:32px;line-height:40px;font-weight:700;letter-spacing:8px;color:${COLOR.text}">${escapeHtml(code)}</p>`,
    text: code,
  };
}

/** Label / value lines, for emails that report facts (a content report). Empty values are left out. */
export function detailList(rows: [label: string, value: string | null][]): { html: string; text: string } {
  const kept = rows.filter((row): row is [string, string] => !!row[1]);
  return {
    html: `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;font-size:15px;line-height:22px;color:${COLOR.text}">${kept
      .map(
        ([label, value]) =>
          `<tr><td style="padding:2px 12px 2px 0;color:${COLOR.muted};vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:2px 0;word-break:break-word">${escapeHtml(value)}</td></tr>`
      )
      .join("")}</table>`,
    text: kept.map(([label, value]) => `${label}: ${value}`).join("\n"),
  };
}
