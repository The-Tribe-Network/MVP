import { documentPage } from "@/lib/landing/document";
import { GUIDELINES } from "@/lib/legal/guidelines";

/** GET /guidelines — linked from the app's Help & about (USET-07) and the App Store listing. Public, no sign-in. */
export function GET() {
  return documentPage(GUIDELINES);
}
