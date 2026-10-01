import { NextResponse } from "next/server";

import { escapeHtml } from "@/lib/email/templates/content-report/escape";

/**
 * A long-form page (privacy policy, terms, guidelines) in the landing pages' look (lib/landing/page.ts), wider for
 * reading. The source is a small Markdown subset written in this repo, never user input: `## ` headings, `* `
 * bullets, blank-line paragraphs, `**bold**` and `[label](url)` links (https or mailto only).
 */
export function documentPage(options: { title: string; updated: string; markdown: string }) {
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(options.title)} · Tribe</title></head>
<body style="margin:0;padding:48px 16px;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#09090b">
<main style="max-width:680px;margin:0 auto;background:#fff;border:1px solid #e4e4e7;border-radius:12px;padding:32px 24px">
<p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#c93d00">Tribe</p>
<h1 style="margin:0 0 4px;font-size:26px;line-height:32px">${escapeHtml(options.title)}</h1>
<p style="margin:0 0 24px;font-size:14px;color:#71717a">Last updated ${escapeHtml(options.updated)}</p>
${renderMarkdown(options.markdown)}
</main>
</body></html>`;
  return new NextResponse(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" },
  });
}

const P = "margin:0 0 12px;font-size:16px;line-height:24px";

function inline(text: string) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[(.+?)\]\(((?:https:\/\/|mailto:)[^)\s]+)\)/g, '<a href="$2" style="color:#c93d00">$1</a>');
}

export function renderMarkdown(markdown: string) {
  return markdown
    .trim()
    .split(/\n{2,}/)
    .map((block) => {
      if (block.startsWith("## ")) {
        return `<h2 style="margin:28px 0 8px;font-size:19px;line-height:26px">${inline(block.slice(3))}</h2>`;
      }
      const lines = block.split("\n");
      if (lines.every((line) => line.startsWith("* "))) {
        const items = lines.map((line) => `<li style="margin:0 0 6px">${inline(line.slice(2))}</li>`).join("");
        return `<ul style="${P};padding-left:20px">${items}</ul>`;
      }
      return `<p style="${P}">${inline(lines.join(" "))}</p>`;
    })
    .join("\n");
}
