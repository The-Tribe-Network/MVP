#!/usr/bin/env node
/**
 * Regenerates the tables in docs/API-SURFACE.md (TRI-148) from the code: every route handler under app/ with its
 * methods, auth, checks and services, and every service with what it writes and what it talks to. Only the part
 * between the GENERATED markers is rewritten; the hand-written sections around it are left alone.
 *
 *   node scripts/api-surface.mjs          rewrite the generated part
 *   node scripts/api-surface.mjs --check  exit 1 if it is out of date (for CI)
 *
 * Static and regex-based on purpose: no build, no imports of app code. It reads what each file says, one level
 * deep (a route's external services are those of the services it imports directly).
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const DOC = join(ROOT, "docs/API-SURFACE.md");
const START = "<!-- GENERATED:START (node scripts/api-surface.mjs) -->";
const END = "<!-- GENERATED:END -->";

function walk(dir, match, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, match, out);
    else if (match(name)) out.push(path);
  }
  return out;
}

// Comments out: a docstring that mentions `getDbTransaction().transaction(...)` or `after()` is not a use of it
const read = (path) =>
  readFileSync(path, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
const unique = (items) => [...new Set(items)].sort();

// ── services ────────────────────────────────────────────────────────────────────────────────────────────────
const serviceDir = join(ROOT, "lib/services");
const services = new Map();
for (const file of readdirSync(serviceDir).filter((f) => f.endsWith(".ts")).sort()) {
  const name = file.replace(/\.ts$/, "");
  const src = read(join(serviceDir, file));
  const external = [];
  if (/cloudinary/.test(src)) external.push("Cloudinary");
  if (/sendEmail|send[A-Z]\w*Email|lib\/email/.test(src)) external.push("Resend");
  if (/publish(Chat)?Event|from ["']ably["']|ably/i.test(src)) external.push("Ably");
  if (/\bfetch\(/.test(src)) external.push("HTTP fetch");
  services.set(name, {
    name,
    writes: /\.(insert|update|delete)\(/.test(src),
    transactions: (src.match(/getDbTransaction\(\)\.transaction\(/g) ?? []).length,
    notify: /\bnotify\(/.test(src),
    deferred: /\bafter\(/.test(src),
    // Route helpers that sign the caller in themselves (event-routes, timeline-routes, poll-votes)
    authenticates: name !== "auth" && /\bgetServerUser\(/.test(src),
    external: unique(external),
    imports: unique([...src.matchAll(/from ["'](?:\.\/|@\/lib\/services\/)([\w-]+)["']/g)].map((m) => m[1])),
  });
}

// ── routes ──────────────────────────────────────────────────────────────────────────────────────────────────
const CHECKS = /\b(guardEventRoute|timelineRoute|checkTribeMembership|getMemberWithPermissions|checkPermission|canUser\w+|canCreate\w+|eventEditability|isTribe\w+|getVisibleMediaInTribe|getMediaInTribe)\(/g;
const routes = walk(join(ROOT, "app"), (f) => f === "route.ts")
  .map((path) => {
    const src = read(path);
    const url =
      "/" +
      relative(join(ROOT, "app"), path)
        .split(sep)
        .slice(0, -1)
        .filter((seg) => !/^\(.*\)$/.test(seg))
        .map((seg) => seg.replace(/^\[\.\.\.(.+)\]$/, "*$1").replace(/^\[(.+)\]$/, ":$1"))
        .join("/");
    const methods = unique([
      ...[...src.matchAll(/export (?:async )?function (GET|POST|PUT|PATCH|DELETE)\b/g)].map((m) => m[1]),
      // `export const { GET, POST } = …` and `export { GET, POST }`
      ...[...src.matchAll(/export (?:const )?\{([^}]+)\}/g)].flatMap((m) => m[1].match(/\b(GET|POST|PUT|PATCH|DELETE)\b/g) ?? []),
    ]);
    const imported = unique(
      [...src.matchAll(/from ["']@\/lib\/services\/([\w-]+)["']/g)].map((m) => m[1]).filter((s) => services.has(s))
    );
    const auth = /CRON_SECRET/.test(src)
      ? "cron secret"
      : /getServerUser\(/.test(src) || imported.some((s) => services.get(s).authenticates)
        ? "session"
        : /x-cld-signature/i.test(src)
          ? "Cloudinary signature"
        : /toNextJsHandler|auth\.handler/.test(src)
          ? "Better-Auth"
          : /verifyUnsubscribeToken/.test(src)
            ? "signed token"
            : "public";
    const external = unique([
      ...imported.flatMap((s) => services.get(s).external),
      ...(/cloudinary/.test(src) ? ["Cloudinary"] : []),
      ...(/nominatim/i.test(src) ? ["Nominatim (OSM)"] : []),
    ]);
    return {
      url,
      methods,
      auth,
      checks: unique([...src.matchAll(CHECKS)].map((m) => m[1])),
      services: imported,
      deferred: /\bafter\(/.test(src),
      external,
    };
  })
  .sort((a, b) => a.url.localeCompare(b.url));

// ── markdown ────────────────────────────────────────────────────────────────────────────────────────────────
const cell = (items) => (items.length ? items.map((i) => `\`${i}\``).join(", ") : "—");
const lines = [];
lines.push(START, "", `### Routes (${routes.length} handler files)`, "");
lines.push(
  "Auth: `session` = `getServerUser()` (cookie or bearer), `Better-Auth` = its catch-all, `cron secret` = `Authorization: Bearer $CRON_SECRET`, `signed token` = HMAC in the URL, `Cloudinary signature` = the webhook's `X-Cld-Signature`, `public` = none. Session also covers routes whose handler lives in a service that signs the caller in (`guardEventRoute`, `timelineRoute`, `poll-votes`). `after()` is the route's own; External is the route plus the services it imports directly. What writes, opens transactions or calls `notify()` is per service, in the second table.",
  "",
  "| Route | Methods | Auth | Checks | Services | `after()` | External |",
  "| --- | --- | --- | --- | --- | --- | --- |"
);
for (const r of routes) {
  lines.push(
    `| \`${r.url}\` | ${r.methods.join(" ")} | ${r.auth} | ${cell(r.checks)} | ${cell(r.services)} | ${r.deferred ? "yes" : ""} | ${r.external.join(", ") || ""} |`
  );
}
lines.push("", `### Services (${services.size})`, "");
lines.push("| Service | Writes | Transactions | `notify()` | `after()` | External | Uses |", "| --- | --- | --- | --- | --- | --- | --- |");
for (const s of services.values()) {
  lines.push(
    `| \`lib/services/${s.name}.ts\` | ${s.writes ? "yes" : ""} | ${s.transactions || ""} | ${s.notify ? "yes" : ""} | ${s.deferred ? "yes" : ""} | ${s.external.join(", ")} | ${cell(s.imports.filter((i) => services.has(i)))} |`
  );
}
lines.push("", END);
const generated = lines.join("\n");

const doc = read(DOC);
const from = doc.indexOf(START);
const to = doc.indexOf(END);
if (from === -1 || to === -1) {
  console.error(`docs/API-SURFACE.md needs the ${START} … ${END} markers`);
  process.exit(1);
}
const next = doc.slice(0, from) + generated + doc.slice(to + END.length);
if (process.argv.includes("--check")) {
  if (next !== doc) {
    console.error("docs/API-SURFACE.md is out of date: run node scripts/api-surface.mjs");
    process.exit(1);
  }
  console.log(`API surface up to date (${routes.length} routes, ${services.size} services)`);
} else {
  writeFileSync(DOC, next);
  console.log(`docs/API-SURFACE.md: ${routes.length} routes, ${services.size} services`);
}
