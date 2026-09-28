import { NextResponse } from "next/server";

import { escapeHtml } from "@/lib/email/templates/content-report/escape";

/**
 * The HTML the landing pages answer with (TRI-340): no web client, no sign-in, nothing private beyond what the email
 * or shared link already said. On a phone the page tries the `tribe://` link once on load; the button is there when
 * the app isn't installed or the browser asks first.
 */
export function landingPage(options: {
  title: string;
  heading: string;
  lines: string[];
  /** The `tribe://` link to open, if any */
  appLink?: string;
  openLabel?: string;
  /** Show how to get the app (invites, where the reader may not have it yet) */
  getTheApp?: boolean;
  status?: number;
}) {
  const download = process.env.APP_DOWNLOAD_URL;
  const openButton = options.appLink
    ? `<a href="${escapeHtml(options.appLink)}" style="display:inline-block;margin-top:8px;padding:12px 24px;font-size:16px;font-weight:600;color:#09090b;background:#ff6900;border-radius:8px;text-decoration:none">${escapeHtml(options.openLabel ?? "Open in Tribe")}</a>`
    : "";
  const getTheApp = options.getTheApp
    ? `<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e4e4e7">
<p style="margin:0 0 8px;font-size:15px;font-weight:600">Don't have Tribe yet?</p>
${
  download
    ? `<p style="margin:0 0 8px;font-size:15px;line-height:22px;color:#3f3f46">Install it, then come back to this page and tap Open in Tribe.</p>
<a href="${escapeHtml(download)}" style="display:inline-block;padding:10px 20px;font-size:15px;font-weight:600;color:#c93d00;border:1px solid #c93d00;border-radius:8px;text-decoration:none">Get the app</a>`
    : `<p style="margin:0;font-size:15px;line-height:22px;color:#3f3f46">Tribe is in a private test on iPhone right now. Ask the person who invited you to add you to the test.</p>`
}
</div>`
    : "";
  const autoOpen = options.appLink
    ? `<script>if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) { setTimeout(function () { window.location.href = ${JSON.stringify(options.appLink)}; }, 250); }</script>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex"><title>${escapeHtml(options.title)}</title></head>
<body style="margin:0;padding:48px 16px;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#09090b">
<main style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #e4e4e7;border-radius:12px;padding:24px">
<p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#c93d00">Tribe</p>
<h1 style="margin:0 0 12px;font-size:22px;line-height:28px">${escapeHtml(options.heading)}</h1>
${options.lines.map((line) => `<p style="margin:0 0 8px;font-size:16px;line-height:24px">${escapeHtml(line)}</p>`).join("\n")}
${openButton}
${getTheApp}
</main>
${autoOpen}
</body></html>`;
  return new NextResponse(html, {
    status: options.status ?? 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}
