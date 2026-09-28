import { publicBaseUrl } from "@/lib/constants/urls";

/**
 * https links that open the app (TRI-340). Mail clients strip or refuse `tribe://` hrefs (Gmail on the web), so every
 * email button and invite link goes to a small page on our host instead: it shows what the link is about, an
 * "Open in Tribe" button with the `tribe://` link, and how to get the app. `INVITE_LINK_BASE_URL` names the host that
 * serves these pages; else the public base URL (the API host).
 */
export function landingBaseUrl(): string {
  return (process.env.INVITE_LINK_BASE_URL || publicBaseUrl()).replace(/\/+$/, "");
}

/** `tribe://tribe/abc/events/def` → `https://<host>/open/tribe/abc/events/def` */
export function openInAppUrl(appLink: string): string {
  const path = appLink.replace(/^tribe:\/\//, "");
  return `${landingBaseUrl()}/open/${path}`;
}

/** An email invitation's page */
export function invitationLandingUrl(invitationId: string): string {
  return `${landingBaseUrl()}/i/${invitationId}`;
}
