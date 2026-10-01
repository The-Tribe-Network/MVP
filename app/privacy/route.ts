import { documentPage } from "@/lib/landing/document";
import { PRIVACY } from "@/lib/legal/privacy";

/** GET /privacy — linked from the app's Help & about (USET-07) and the App Store listing. Public, no sign-in. */
export function GET() {
  return documentPage(PRIVACY);
}
