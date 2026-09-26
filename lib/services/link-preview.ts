import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { LinkPreview } from "@/lib/database/schemas/chat";

/**
 * Link previews for chat messages (TRI-315, owner 2026-09-25). The server fetches a URL a member typed, so
 * every hop is checked against SSRF: http(s) only, default ports, every resolved address public, redirects
 * followed by hand (each one re-checked), a short timeout and a byte cap. Residual risk: DNS can change between
 * the check and the connection (rebinding); acceptable for previews of links typed by tribe members.
 */

const TIMEOUT_MS = 4000;
const MAX_BYTES = 512 * 1024;
const MAX_REDIRECTS = 3;
const MAX_FIELD = 300;

/** The first http(s) URL in a message body, without trailing punctuation. */
export function firstUrl(body: string): string | null {
  const match = body.match(/https?:\/\/[^\s<>"']+/i);
  if (!match) return null;
  return match[0].replace(/[),.!?;:\]]+$/, "");
}

function isPrivateV4(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
    (a === 169 && b === 254) || // link-local, cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19))
  );
}

function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 4) return isPrivateV4(ip);
  const v6 = ip.toLowerCase();
  const mapped = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateV4(mapped[1]);
  return (
    v6 === "::" || v6 === "::1" ||
    v6.startsWith("fc") || v6.startsWith("fd") || // unique local
    v6.startsWith("fe8") || v6.startsWith("fe9") || v6.startsWith("fea") || v6.startsWith("feb") || // link-local
    v6.startsWith("ff") // multicast
  );
}

/** Whether a URL may be fetched: http(s), default port, and every address it resolves to is public. */
export async function isFetchableUrl(raw: string): Promise<boolean> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  if (url.port && url.port !== "80" && url.port !== "443") return false;
  if (url.username || url.password) return false;
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal") || host.endsWith(".local")) {
    return false;
  }
  try {
    const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true, verbatim: true });
    return addresses.length > 0 && addresses.every((entry) => !isPrivateAddress(entry.address));
  } catch {
    return false;
  }
}

async function readCapped(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
  }
  await reader.cancel().catch(() => {});
  return new TextDecoder("utf-8", { fatal: false }).decode(Buffer.concat(chunks).subarray(0, MAX_BYTES));
}

function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function clean(value: string | undefined): string | null {
  if (!value) return null;
  const text = decodeEntities(value).replace(/\s+/g, " ").trim();
  return text ? text.slice(0, MAX_FIELD) : null;
}

/** `<meta property|name="key" content="…">` in either attribute order. */
function meta(html: string, key: string): string | undefined {
  const k = key.replace(/[.:]/g, "\\$&");
  const a = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${k}["'][^>]*content=["']([^"']*)["']`, "i"));
  if (a) return a[1];
  const b = html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${k}["']`, "i"));
  return b?.[1];
}

/** Parse Open Graph tags (with <title> / description fallbacks). Exported for tests. */
export function parsePreview(html: string, finalUrl: string): LinkPreview | null {
  const head = html.slice(0, MAX_BYTES);
  const title = clean(meta(head, "og:title") ?? meta(head, "twitter:title") ?? head.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]);
  const description = clean(meta(head, "og:description") ?? meta(head, "twitter:description") ?? meta(head, "description"));
  const siteName = clean(meta(head, "og:site_name")) ?? new URL(finalUrl).hostname.replace(/^www\./, "");
  let imageUrl: string | null = null;
  const image = meta(head, "og:image") ?? meta(head, "twitter:image");
  if (image) {
    try {
      const resolved = new URL(decodeEntities(image), finalUrl);
      if (resolved.protocol === "https:" || resolved.protocol === "http:") imageUrl = resolved.toString();
    } catch {
      imageUrl = null;
    }
  }
  if (!title && !description && !imageUrl) return null;
  return { url: finalUrl, title, description, imageUrl, siteName };
}

/** Fetch and parse a preview for `raw`, or null when it can't be fetched safely or has nothing to show. */
export async function fetchLinkPreview(raw: string): Promise<LinkPreview | null> {
  let current = raw;
  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      if (!(await isFetchableUrl(current))) return null;
      const response = await fetch(current, {
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { "User-Agent": "TribeLinkPreview/1.0", Accept: "text/html,application/xhtml+xml" },
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        await response.body?.cancel().catch(() => {});
        if (!location) return null;
        current = new URL(location, current).toString();
        continue;
      }
      if (!response.ok) return null;
      if (!(response.headers.get("content-type") ?? "").includes("html")) {
        await response.body?.cancel().catch(() => {});
        return null;
      }
      return parsePreview(await readCapped(response), current);
    }
    return null;
  } catch {
    return null;
  }
}
