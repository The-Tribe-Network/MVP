import * as Sentry from "@sentry/nextjs";
import { sentryServerOptions } from "@/lib/clients/sentry";

// Loaded by instrumentation.ts on the Node runtime. Off unless SENTRY_DSN is set.
const options = sentryServerOptions();
if (options) {
  Sentry.init(options);
}
